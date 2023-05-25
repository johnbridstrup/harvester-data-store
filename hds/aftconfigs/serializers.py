from common.serializers.reportserializer import ReportSerializerBase
from common.serializers.userserializer import UserCustomSerializer
from event.serializers import EventSerializerMixin, EventSerializer
from harvester.serializers.harvesterserializer import HarvesterMinimalSerializer
from location.serializers.locationserializer import LocationMinimalSerializer

from .models import ConfigReport

class ConfigReportSerializer(EventSerializerMixin, ReportSerializerBase):
    class Meta:
        model = ConfigReport
        fields = ('__all__')
        read_only_fields = ('creator',)

    def to_internal_value(self, data):
        report = data.copy()
        data, _ = self.extract_basic(report)
        UUID = self.extract_uuid(report)
        creator = self.get_user_from_request()
        event = self.get_or_create_event(UUID, creator, ConfigReport.__name__)
        data['event'] = event.id
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
