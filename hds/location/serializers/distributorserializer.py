# import serializers
from rest_framework import serializers

from common.serializers.userserializer import UserCustomSerializer
from ..models import Distributor


class DistributorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Distributor
        fields = ('__all__')
        read_only_fields = ('creator',)


class DistributorListSerializer(DistributorSerializer):
    """
    Return a response with minimal nesting to the list view

    Exception:
        - creator & modifiedBy objects are required.
    """

    creator = UserCustomSerializer(read_only=True)
    modifiedBy = UserCustomSerializer(read_only=True)

    class Meta(DistributorSerializer.Meta):
        pass
