from rest_framework import serializers

from gripreport.serializers.gripreportserializers import GripReportListSerializer
from harvester.serializers.harvesterserializer import FruitMinimalSerializer, HarvesterMinimalSerializer
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
        fields = ("__all__")
