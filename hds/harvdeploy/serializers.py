from django.utils.timezone import datetime
from rest_framework import serializers
from taggit.serializers import TagListSerializerField, TaggitSerializer

from common.models import Tags
from common.serializers.reportserializer import ReportSerializerBase
from common.serializers.userserializer import UserCustomSerializer
from harvester.models import Fruit
from harvester.serializers.fruitserializer import FruitSerializer
from .models import HarvesterCodeRelease, HarvesterVersionReport


class HarvesterCodeReleaseSerializer(TaggitSerializer, serializers.ModelSerializer):
    tags = TagListSerializerField(required=False)

    class Meta:
        model = HarvesterCodeRelease
        fields = "__all__"
        read_only_fields = ("creator",)

    def to_internal_value(self, data):
        release = data.copy()
        version = release.get("version")
        fruit_str = release.get("project").lower()
        tags = release.pop("tags", [])
        fruit = Fruit.objects.get(name=fruit_str)

        data = {"version": version, "release": release, "fruit": fruit.id, "tags": tags}
        return super().to_internal_value(data)


class HarvesterCodeReleaseDetailSerializer(HarvesterCodeReleaseSerializer):
    """
    Return a response with full nesting to the detail view
    for any related objected.
    """

    fruit = FruitSerializer(read_only=True)
    creator = UserCustomSerializer(read_only=True)
    modifiedBy = UserCustomSerializer(read_only=True)

    class Meta(HarvesterCodeReleaseSerializer.Meta):
        pass


class HarvesterVersionReportSerializer(TaggitSerializer, ReportSerializerBase):
    report_type = "version_report"
    REPORT_DATA_PATTERN_PROPERTIES = {
        "^(master|((aft-)?(robot|stereo)\\d+))": {
            "type": "object",
            "oneOf": [
                {
                    "type": "object",
                    "properties": {"error": {"type": ["string", "null"]}},
                    "required": ["error"],
                },
                {
                    "type": "object",
                    "properties": {
                        "version": {"type": ["string", "number"]},
                        "type": {"type": "string"},
                        "project": {"type": "string"},
                        "dirty": {"type": "object"},
                        "unexpected": {"type": "object"},
                        "error": {"type": ["string", "null"]},
                    },
                    "required": ["version", "dirty", "unexpected"],
                },
            ],
        }
    }
    REPORT_DATA_ALLOW_EXTRA = False

    tags = TagListSerializerField(required=False)

    class Meta:
        model = HarvesterVersionReport
        fields = "__all__"
        read_only_fields = ("creator",)

    def create(self, validated_data):
        harv = validated_data["harvester"]
        # Check if version hasn't changed
        try:
            last_vers = harv.current_version(before=validated_data["reportTime"])
            if HarvesterVersionReport.is_duplicate_version(
                validated_data["report"]["data"], last_vers.report["data"]
            ):
                last_vers.lastModified = datetime.now()
                last_vers.save()
                return last_vers

        except HarvesterVersionReport.DoesNotExist:
            return super().create(validated_data)

        return super().create(validated_data)

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data["conflicts"] = instance.conflicts
        return data

    def to_internal_value(self, data):
        try:
            self.validate_incoming_report(data)
            tags = []
        except serializers.ValidationError:
            # try anyway, it has been logged.
            tags = [Tags.INVALIDSCHEMA.value]

        report = data.copy()
        data, _ = self.extract_basic(report)

        data.update(
            {
                "is_dirty": self.Meta.model.check_dirty(report["data"]),
                "has_unexpected": self.Meta.model.check_unexpected(report["data"]),
                "tags": tags,
            }
        )
        return super().to_internal_value(data)
