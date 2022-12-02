from .models import MigrationLog

from rest_framework import serializers


class MigrationLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = MigrationLog
        fields = ('__all__')
        read_only_fields = ('creator',)
        