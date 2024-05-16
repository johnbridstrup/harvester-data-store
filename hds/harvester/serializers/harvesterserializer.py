# import serializers
from rest_framework import serializers

from common.serializers.userserializer import UserCustomSerializer
from harvdeploy.models import HarvesterVersionReport
from harvdeploy.serializers import (
    HarvesterCodeReleaseSerializer,
    HarvesterVersionReportSerializer,
)
from location.serializers.locationserializer import (
    LocationSerializer,
    LocationMinimalSerializer,
    LocationListSerializer,
)
from .fruitserializer import (
    FruitSerializer,
    FruitMinimalSerializer,
)
from ..models import Harvester


class HarvesterMinimalSerializer(serializers.ModelSerializer):
    fruit = FruitMinimalSerializer(read_only=True)
    location = LocationMinimalSerializer(read_only=True)

    class Meta:
        model = Harvester
        fields = ("id", "url", "harv_id", "location", "fruit", "is_emulator")


class HarvesterSerializer(serializers.ModelSerializer):
    class Meta:
        model = Harvester
        fields = "__all__"
        read_only_fields = ("creator",)

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data["harvester_history"] = f"/harvesterhistory/?harv_id={instance.harv_id}"
        data["version_history"] = "versions/"
        data["assets"] = "assets/"
        data["config"] = "config/"
        return data


class HarvesterListSerializer(HarvesterSerializer):
    """
    Return a response with minimal nesting to the list view.

    Exception:
        - fruit & location are required objects
    """

    fruit = FruitSerializer(read_only=True)
    location = LocationListSerializer(read_only=True)

    class Meta(HarvesterSerializer.Meta):
        pass


class HarvesterDetailSerializer(HarvesterSerializer):
    """
    Return a response with full nesting to the detail view
    for any related objected.
    """

    fruit = FruitSerializer(read_only=True)
    location = LocationSerializer(read_only=True)
    release = HarvesterCodeReleaseSerializer(read_only=True)
    creator = UserCustomSerializer(read_only=True)
    modifiedBy = UserCustomSerializer(read_only=True)

    class Meta(HarvesterSerializer.Meta):
        pass

    def to_representation(self, instance):
        data = super().to_representation(instance)
        try:
            vers = instance.current_version()
            data["version"] = HarvesterVersionReportSerializer(vers).data
        except HarvesterVersionReport.DoesNotExist:
            data["version"] = None
        return data


class HarvesterHistorySerializer(serializers.ModelSerializer):
    fruit = FruitSerializer()
    location = LocationSerializer()
    release = HarvesterCodeReleaseSerializer()

    class Meta:
        model = Harvester.history.model
        fields = "__all__"
        read_only_fields = ("__all__",)
