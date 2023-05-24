# import serializers
from rest_framework import serializers

from common.serializers.userserializer import UserCustomSerializer
from .distributorserializer import DistributorSerializer, DistributorMinimalSerializer
from ..models import Location


class LocationMinimalSerializer(serializers.ModelSerializer):
    distributor = DistributorMinimalSerializer(read_only=True)
    class Meta:
        model = Location
        fields = ('id', 'url', 'ranch', 'distributor',)
        read_only_fields = ('creator',)


class LocationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Location
        fields = ('__all__')
        read_only_fields = ('creator',)


class LocationListSerializer(LocationSerializer):
    """
    Return a response with minimal nesting to the list view

    Exception:
        - This is nested to avail distributor name, creator and
        modifiedBy
    """
    distributor = DistributorSerializer(read_only=True)
    creator = UserCustomSerializer(read_only=True)
    modifiedBy = UserCustomSerializer(read_only=True)

    class Meta(LocationSerializer.Meta):
        pass

