from rest_framework import serializers
from .models import AFTExceptionCode, AFTExceptionCodeManifest, AFTException


class AFTExceptionCodeManifestSerializer(serializers.ModelSerializer):
    class Meta:
        model = AFTExceptionCodeManifest
        fields = ('__all__')
        read_only_fields = ('creator',)


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

    def to_representation(self, instance):
        data = super().to_representation(instance)
        code = AFTExceptionCodeSerializer(instance.code).data
        data['code'] = code
        return data

    class Meta:
        model = AFTException
        fields = ('__all__')
        read_only_fields = ('creator',)