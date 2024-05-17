from rest_framework import serializers

from gripreport.serializers.gripreportserializers import (
    GripReportListSerializer,
)
from harvester.serializers.harvesterserializer import (
    FruitMinimalSerializer,
    HarvesterMinimalSerializer,
)
from location.serializers.locationserializer import LocationMinimalSerializer

from .candidateserializers import CandidateMinimalSerializer
from ..models import Grip


class GripMinimalSerializer(serializers.ModelSerializer):
    report = GripReportListSerializer(read_only=True)
    fruit = FruitMinimalSerializer(read_only=True)
    harvester = HarvesterMinimalSerializer(read_only=True)
    location = LocationMinimalSerializer(read_only=True)
    candidate = CandidateMinimalSerializer(read_only=True)

    class Meta:
        model = Grip
        fields = [
            "report",
            "fruit",
            "harvester",
            "location",
            "candidate",
            "robot_id",
            "success",
            "grip_start_ts",
            "grip_end_ts",
            "pick_result",
            "grip_result",
            "creator",
            "created",
            "id",
        ]


class GripFullSerializer(serializers.ModelSerializer):
    report = GripReportListSerializer(read_only=True)
    fruit = FruitMinimalSerializer(read_only=True)
    harvester = HarvesterMinimalSerializer(read_only=True)
    location = LocationMinimalSerializer(read_only=True)
    candidate = CandidateMinimalSerializer(read_only=True)

    class Meta:
        model = Grip
        fields = "__all__"


class GripFlattenedListSerializer(serializers.ModelSerializer):
    report = GripReportListSerializer(read_only=True)

    def to_representation(self, instance):
        data = super().to_representation(instance)

        # Get pick session UUID from report
        ps_uuid = data["report"]["pick_session"]["UUID"]
        data["pick_session"] = ps_uuid
        del data["report"]

        # Flatten grip_data
        nested_data = data["grip_data"]
        for key, value in nested_data.items():
            data[key] = value
        del data["grip_data"]
        return data

    class Meta:
        model = Grip
        fields = (
            "id",
            "grip_data",
            "report",
        )
