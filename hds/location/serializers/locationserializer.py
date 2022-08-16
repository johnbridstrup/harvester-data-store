# import serializers
from rest_framework import serializers

from .distributorserializer import DistributorSerializer
from ..models import Location


class LocationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Location
        fields = ('__all__')
        read_only_fields = ('creator',)

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data['distributor'] = DistributorSerializer(instance.distributor).data
        return data


