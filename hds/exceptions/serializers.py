from rest_framework import serializers
from .models import AFTExceptionCode, AFTException


class AFTExceptionCodeSerializer(serializers.ModelSerializer):
    class Meta:
        model = AFTExceptionCode
        fields = ('__all__')
        read_only_fields = ('creator',)

class AFTExceptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = AFTException
        fields = ('__all__')
        read_only_fields = ('creator',)