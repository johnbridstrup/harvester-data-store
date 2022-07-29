from rest_framework import serializers
from .models import AFTExceptionCode, AFTException


class AFTExceptionCodeSerializer(serializers.ModelSerializer):
    class Meta:
        model = AFTExceptionCode
        fields = ('__all__')
        read_only_fields = ('creator',)

class AFTExceptionSerializer(serializers.ModelSerializer):
    def to_internal_value(self, data):
        code = AFTExceptionCode.objects.get(code=data['code'])
        data._mutable = True
        data['code'] = code.pk
        data._mutable = False
        return super().to_internal_value(data)

    class Meta:
        model = AFTException
        fields = ('__all__')
        read_only_fields = ('creator',)