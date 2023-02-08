from rest_framework import serializers
from taggit.serializers import TaggitSerializer

from common.models import Tags
from common.serializers.reportserializer import ReportSerializerBase
from event.serializers import PickSessionSerializerMixin

from .models import AutodiagnosticsReport


class AutodiagnosticsReportSerializer(TaggitSerializer, PickSessionSerializerMixin, ReportSerializerBase):
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
        data = self.extract_basic(data)
        result = report["data"].get("passed_autodiag")
        robot_id = report["data"].get("robot_id")
        gripper_sn = report["data"].get("serial_no")
        pick_session_uuid = self.extract_uuid(report, "pick_session_uuid")

        data.update({
            "result": result,
            "robot": robot_id,
            "gripper_sn": gripper_sn,
            "tags": tags,
            "pick_session_uuid": pick_session_uuid,
        })
        return super().to_internal_value(data)