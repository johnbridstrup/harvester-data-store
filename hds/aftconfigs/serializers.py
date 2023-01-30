from common.serializers.reportserializer import ReportSerializerBase
from event.serializers import EventSerializerMixin

from .models import ConfigReport

class ConfigReportSerializer(EventSerializerMixin, ReportSerializerBase):
    class Meta:
        model = ConfigReport
        fields = ('__all__')
        read_only_fields = ('creator',)

    def to_internal_value(self, data):
        report = data.copy()
        data = self.extract_basic(report)
        return super().to_internal_value(data)