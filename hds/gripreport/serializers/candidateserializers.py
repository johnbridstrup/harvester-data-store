from rest_framework import serializers

from gripreport.serializers.gripreportserializers import (
    GripReportListSerializer,
)
from harvester.serializers.harvesterserializer import (
    FruitMinimalSerializer,
    HarvesterMinimalSerializer,
)
from location.serializers.locationserializer import LocationMinimalSerializer

from ..models import Candidate


class CandidateMinimalSerializer(serializers.ModelSerializer):
    report = GripReportListSerializer(read_only=True)
    fruit = FruitMinimalSerializer(read_only=True)
    harvester = HarvesterMinimalSerializer(read_only=True)
    location = LocationMinimalSerializer(read_only=True)

    class Meta:
        model = Candidate
        fields = [
            "report",
            "fruit",
            "harvester",
            "location",
            "robot_id",
            "score",
            "ripeness",
            "cand_id",
            "creator",
            "created",
            "id",
        ]


class CandidateFullSerializer(serializers.ModelSerializer):
    report = GripReportListSerializer(read_only=True)
    fruit = FruitMinimalSerializer(read_only=True)
    harvester = HarvesterMinimalSerializer(read_only=True)
    location = LocationMinimalSerializer(read_only=True)

    class Meta:
        model = Candidate
        fields = "__all__"


class CandidateFlattenedListSerializer(serializers.ModelSerializer):
    report = GripReportListSerializer(read_only=True)

    def to_representation(self, instance):
        data = super().to_representation(instance)

        # Get pick session UUID from report
        ps_uuid = data["report"]["pick_session"]["UUID"]
        data["pick_session"] = ps_uuid
        del data["report"]

        # Flatten candidate_data
        nested_data = data["candidate_data"]
        for key, value in nested_data.items():
            data[key] = value
        del data["candidate_data"]
        return data

    class Meta:
        model = Candidate
        fields = (
            "id",
            "candidate_data",
            "report",
        )
