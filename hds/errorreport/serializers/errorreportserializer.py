from common.serializers.reportserializer import ReportSerializerBase
from ..models import ErrorReport
from harvester.models import Harvester


class ErrorReportSerializer(ReportSerializerBase):
    """Serializer for the ErrorReport model"""

    def to_internal_value(self, data):
        report = data.copy()
        harv_id = int(report['data']['sysmon_report']['serial_number'])
        harvester = Harvester.objects.get(harv_id=harv_id)
        reportTime = self.extract_timestamp(report['timestamp'])

        data = {
            'harvester': harvester.id,
            'location': harvester.location.id,
            'reportTime': reportTime,
            'report': report
        }
        return super().to_internal_value(data)

    class Meta:
        model = ErrorReport
        fields = ('__all__')
        read_only_fields = ('creator',)

