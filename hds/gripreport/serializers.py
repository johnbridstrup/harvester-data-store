from common.reports import DTimeFormatter
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
        pick_session_start_ts = report.get("pick_session_start_time", None)
        pick_session_start_time = DTimeFormatter.from_timestamp(pick_session_start_ts)
        pick_session_end_ts = report.get("timestamp")
        pick_session_end_time = DTimeFormatter.from_timestamp(pick_session_end_ts)
        data, harv_obj = self.extract_basic(report)

        creator = self.get_user_from_request()

        # Event
        event_uuid = self.extract_uuid(report)
        event = self.get_or_create_event(event_uuid, creator, GripReport.__name__)
        data['event'] = event.id
        
        # Pick Session
        pick_session_uuid = self.extract_uuid(report, "pick_session_uuid")
        pick_session = self.get_or_create_picksession(pick_session_uuid, creator, GripReport.__name__)
        self.set_picksess_harv_location(pick_session, harv_obj)
        self.set_picksess_time(pick_session, pick_session_start_time, pick_session_end_time)
        data['pick_session'] = pick_session.id
        
        return super().to_internal_value(data)