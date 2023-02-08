from common.serializers.reportserializer import ReportSerializerBase
from event.serializers import PickSessionSerializerMixin

from .models import GripReport

class GripReportSerializer(PickSessionSerializerMixin, ReportSerializerBase):
    class Meta:
        model = GripReport
        fields = ('__all__')
        read_only_fields = ('creator',)

    def to_internal_value(self, data):
        report = data.copy()
        pick_session_uuid = self.extract_uuid(report, "pick_session_uuid")
        data = self.extract_basic(report)
        data.update({"pick_session_uuid": pick_session_uuid})
        return super().to_internal_value(data)