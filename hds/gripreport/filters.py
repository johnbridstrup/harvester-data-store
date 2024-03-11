from common.filters import (
    CommonInfoFilterset,
    DTimeFilter,
    LinkedReportHarvesterFilter,
    LinkedReportStartEndFilter,
    ListFilter,
    EventUUIDFilter,
    ReportFilterset,
)

from .models import Candidate, GripReport


class PickSessionReportFilterset(ReportFilterset):
    uuid = EventUUIDFilter()
    class Meta:
        model = GripReport
        fields = ReportFilterset.FIELDS_BASE + [
            'harvester__harv_id', 
            'event__UUID',
            'location__ranch',
        ]


class CandidateFilterset(CommonInfoFilterset, LinkedReportHarvesterFilter, LinkedReportStartEndFilter):
    uuid = EventUUIDFilter(field_name="report__event")
    picksess = EventUUIDFilter(field_name="report__pick_session")
    robot_ids = ListFilter(field_type=int, field_name="robot_id")

    class Meta:
        model = Candidate
        fields = CommonInfoFilterset.FIELDS_BASE + [
            'uuid',
            'picksess',
            'robot_ids',
            *LinkedReportHarvesterFilter.FIELDS,
            *LinkedReportStartEndFilter.FIELDS,
        ]
