from django.contrib.auth.models import User

from common.reports import DTimeFormatter
from common.serializers.reportserializer import ReportSerializerBase
from common.serializers.userserializer import UserCustomSerializer
from event.serializers import (
    PickSessionSerializerMixin,
    EventSerializer,
    PickSessionMinimalSerializer
)
from harvester.serializers.harvesterserializer import HarvesterMinimalSerializer
from location.serializers.locationserializer import LocationMinimalSerializer

from .models import GripReport

class GripReportSerializer(PickSessionSerializerMixin, ReportSerializerBase):
    class Meta:
        model = GripReport
        fields = ('__all__')

    def to_internal_value(self, data):
        report = data.copy()
        pick_session_start_ts = report.get("pick_session_start_time", None)
        pick_session_start_time = DTimeFormatter.from_timestamp(pick_session_start_ts)
        pick_session_end_ts = report.get("timestamp")
        pick_session_end_time = DTimeFormatter.from_timestamp(pick_session_end_ts)
        data, harv_obj = self.extract_basic(report)

        if "request" in self.context:
            creator = self.get_user_from_request()
        elif "creator" in report:
            creator = self.get_user_from_id(data["creator"])
        else:
            raise KeyError("Cannot retrieve creator.")

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
    

class GripReportListSerializer(GripReportSerializer):
    """
    Return a response with minimal nesting to the list view
    for any related objected.
    """

    event = EventSerializer(read_only=True)
    harvester = HarvesterMinimalSerializer(read_only=True)
    location = LocationMinimalSerializer(read_only=True)
    pick_session = PickSessionMinimalSerializer(read_only=True)
    creator = UserCustomSerializer(read_only=True)
    modifiedBy = UserCustomSerializer(read_only=True)

    class Meta(GripReportSerializer.Meta):
        model = GripReport
        fields = [
            "reportTime",
            "event",
            "harvester",
            "location",
            "pick_session",
            "creator",
            "modifiedBy",
        ]


class GripReportDetailSerializer(GripReportSerializer):
    """
    Return a response with full nesting to the detail view
    for any related objected.
    """

    event = EventSerializer(read_only=True)
    harvester = HarvesterMinimalSerializer(read_only=True)
    location = LocationMinimalSerializer(read_only=True)
    pick_session = PickSessionMinimalSerializer(read_only=True)
    creator = UserCustomSerializer(read_only=True)
    modifiedBy = UserCustomSerializer(read_only=True)

    class Meta(GripReportSerializer.Meta):
        pass
