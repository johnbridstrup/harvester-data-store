from rest_framework import serializers
from taggit.serializers import TaggitSerializer

from common.models import Tags
from common.serializers.reportserializer import ReportSerializerBase
from event.models import Event
from event.serializers import EventSerializerMixin

from .models import AutodiagnosticsReport


class AutodiagnosticsReportSerializer(TaggitSerializer, EventSerializerMixin, ReportSerializerBase):
    class Meta:
        model = AutodiagnosticsReport
        fields = ('__all__')
        read_only_fields = ('creator',)

    def to_internal_value(self, data):
        try:
            self.validate_incoming_report(data)
            tags = []
        except serializers.ValidationError:
            # We will try anyway.
            # This failure has already been logged.
            # The tag will only apply if we are able to ingest.
            tags = [Tags.INVALIDSCHEMA.value]
        
        report = data.copy()
        reportTime = self.extract_timestamp(data)
        UUID = data.get('uuid', Event.generate_uuid())
        harv_id = self.get_serial_number(report)
        harv = self.get_harvester(harv_id, report)
        result = report["data"].get("passed_autodiag")
        robot_id = report["data"].get("robot_id")
        gripper_sn = report["data"].get("serial_no")

        data = {
            "report": report,
            "reportTime": reportTime,
            "UUID": UUID,
            "harvester": harv.id,
            "location": harv.location.id,
            "result": result,
            "robot": robot_id,
            "gripper_sn": gripper_sn,
            "tags": tags,
        }
        return super().to_internal_value(data)