from rest_framework import serializers
from .models import AFTExceptionCode


class AFTExceptionCodeSerializer(serializers.ModelSerializer):
    class Meta:
        model = AFTExceptionCode
        fields = ('__all__')
        read_only_fields = ('creator',)