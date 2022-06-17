from common.serializers.reportserializer import ReportSerializerBase
from ..models import ErrorReport
from harvester.models import Harvester


class ErrorReportSerializer(ReportSerializerBase):
    """Serializer for the ErrorReport model"""

    def __init__(self, *args, **kwargs):
        """ prepare data from request """
        if 'data' in kwargs and 'sysmon_report' in kwargs['data']['data']:
            report = kwargs.pop('data', None)
            harv_id = int(report['data']['sysmon_report']['serial_number'])
            harvester = Harvester.objects.get(harv_id=harv_id)
            reportTime = self.extract_timestamp(report['timestamp'])

            kwargs['data'] = {
                'harvester': harvester.id,
                'location': harvester.location.id,
                'reportTime': reportTime,
                'report': report
            }
        super().__init__(*args, **kwargs)

    def create(self, validated_data):
        return super().create(validated_data)

    def update(self, instance, validated_data):
        return super().update(instance, validated_data)

    class Meta:
        model = ErrorReport
        fields = ('__all__')
        read_only_fields = ('creator',)


class ErrorReportListSerializer(ReportSerializerBase):
    """Serializer for the ErrorReport search and list"""
    class Meta:
        model = ErrorReport
        fields = ('__all__')
        read_only_fields = ('creator',)