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
        UUID = self.extract_uuid(report)
        creator = self.get_user_from_request()
        event = self.get_or_create_event(UUID, creator, ConfigReport.__name__)
        data['event'] = event.id
        return super().to_internal_value(data)

    def to_representation(self, instance: ConfigReport):
        data = super().to_representation(instance)
        event = self.serialize_event(instance.event)
        data['event'] = event
        return data