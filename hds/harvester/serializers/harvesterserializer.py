# import serializers
from rest_framework import serializers
from ..models import Harvester


class HarvesterSerializer(serializers.ModelSerializer):
    class Meta:
        model = Harvester
        fields = ('__all__')
        read_only_fields = ('creator',)


