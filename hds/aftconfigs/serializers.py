import structlog
from rest_framework import serializers

from common.serializers.reportserializer import ReportSerializerBase
from common.serializers.userserializer import UserCustomSerializer
from event.serializers import EventSerializerMixin, EventSerializer
from harvester.serializers.harvesterserializer import HarvesterMinimalSerializer
from harvester.serializers.harvesterswinfoserializer import (
    HarvesterSWInfoSerializer,
)
from location.serializers.locationserializer import LocationMinimalSerializer

from .models import ConfigReport


logger = structlog.get_logger(__name__)


class ConfigReportSerializer(EventSerializerMixin, ReportSerializerBase):
    class Meta:
        model = ConfigReport
        fields = "__all__"
        read_only_fields = ("creator",)

    def to_internal_value(self, data):
        report = data.copy()
        data, _ = self.extract_basic(report)
        UUID = self.extract_uuid(report)
        creator = self.get_user_from_request()
        event = self.get_or_create_event(UUID, creator, ConfigReport.__name__)
        data["event"] = event.id
        try:
            version_info = {
                "githash": data["report"]["version_info"]["githash"],
                "dirty": data["report"]["version_info"]["dirty"],
                "branchname": data["report"]["version_info"]["branchname"],
                "deployer": data["report"]["version_info"]["deployer"],
                "deployed_ts": data["report"]["version_info"]["deployed_ts"],
                "harvester": data["harvester"],
                "creator": creator,
            }
            serializer = HarvesterSWInfoSerializer(
                data={
                    "version_info": version_info,
                    "serial_number": data["report"]["serial_number"],
                },
                context={"request": self.context.get("request")},
            )
            serializer.is_valid(raise_exception=True)
            swinfo = serializer.save()
            logger.info(
                f"sucessfully created harvesterswinfo object ID {swinfo.pk}"
            )
        except (KeyError, serializers.ValidationError) as e:
            logger.warning(
                f"could not create harvesterswinfo due to the error {e}"
            )

        return super().to_internal_value(data)


class ConfigReportDetailSerializer(ConfigReportSerializer):
    """
    Return a response with full nesting to the detail view
    for any related objects.
    """

    creator = UserCustomSerializer(read_only=True)
    modifiedBy = UserCustomSerializer(read_only=True)
    event = EventSerializer(read_only=True)
    harvester = HarvesterMinimalSerializer(read_only=True)
    location = LocationMinimalSerializer(read_only=True)

    class Meta(ConfigReportSerializer.Meta):
        pass
