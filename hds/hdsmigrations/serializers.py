from rest_framework import serializers

from .models import MigrationLog


class MigrationLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = MigrationLog
        fields = "__all__"
        read_only_fields = ("creator",)
