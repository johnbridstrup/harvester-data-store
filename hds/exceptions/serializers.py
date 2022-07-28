from django.http import QueryDict
from rest_framework import serializers
from .models import AFTExceptionCode, AFTException


class AFTExceptionCodeSerializer(serializers.ModelSerializer):
    class Meta:
        model = AFTExceptionCode
        fields = ('__all__')
        read_only_fields = ('creator',)

class AFTExceptionSerializer(serializers.ModelSerializer):
    def to_representation(self, instance):
        exceptions = super().to_representation(instance)

        # Serialize AFTExceptionCode object
        code = AFTExceptionCode.objects.get(id=exceptions['code'])
        code_data = AFTExceptionCodeSerializer(code).data

        exceptions['code'] = code_data
        return exceptions
    
    def to_internal_value(self, data):
        code = AFTExceptionCode.objects.get(code=data['code'])
        if isinstance(data, QueryDict):
            # This is required for tests to pass
            data._mutable = True
            data['code'] = code.pk
            data._mutable = False
        else:
            data['code'] = code.pk
        return super().to_internal_value(data)

    class Meta:
        model = AFTException
        fields = ('__all__')
        read_only_fields = ('creator',)