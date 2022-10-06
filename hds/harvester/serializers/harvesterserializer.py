# import serializers
from rest_framework import serializers

from harvdeploy.serializers import HarvesterCodeReleaseSerializer
from location.serializers.locationserializer import LocationSerializer
from .fruitserializer import FruitSerializer
from ..models import Harvester


class HarvesterSerializer(serializers.ModelSerializer):
    class Meta:
        model = Harvester
        fields = ('__all__')
        read_only_fields = ('creator',)

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data['fruit'] = FruitSerializer(instance.fruit).data
        data['location'] = LocationSerializer(instance.location).data
        if instance.release:
            data['release'] = HarvesterCodeReleaseSerializer(instance.release).data
        return data


