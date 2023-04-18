from common.serializers.reportserializer import ReportSerializerBase
from event.serializers import PickSessionSerializerMixin

from .models import GripReport

class GripReportSerializer(PickSessionSerializerMixin, ReportSerializerBase):
    class Meta:
        model = GripReport
        fields = ('__all__')
        read_only_fields = ('creator',)

    def to_representation(self, instance):
        data = super().to_representation(instance)
        event = self.serialize_event(instance.event)
        pick_session = self.serialize_picksession(instance.pick_session)
        data['event'] = event
        data['pick_session'] = pick_session
        return data


    def to_internal_value(self, data):
        report = data.copy()
        data = self.extract_basic(report)

        creator = self.get_user_from_request()
        event_uuid = self.extract_uuid(report)
        pick_session_uuid = self.extract_uuid(report, "pick_session_uuid")
        pick_session = self.get_or_create_picksession(pick_session_uuid, creator, GripReport.__name__)
        event = self.get_or_create_event(event_uuid, creator, GripReport.__name__)
        data['pick_session'] = pick_session.id
        data['event'] = event.id
        
        return super().to_internal_value(data)