from django_filters import rest_framework as filters

from common.filters import (
    CommonInfoFilterset,
    LinkedReportHarvesterFilter,
    LinkedReportStartEndFilter,
    ListFilter,
    EventUUIDFilter,
    ReportFilterset,
)

from .models import Candidate, Grip, GripReport


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


class GripFilterset(CommonInfoFilterset, LinkedReportHarvesterFilter, LinkedReportStartEndFilter):
    uuid = EventUUIDFilter(field_name="report__event")
    picksess = EventUUIDFilter(field_name="report__pick_session")
    robot_ids = ListFilter(field_type=int, field_name="robot_id")
    success = filters.BooleanFilter(field_name="success")

    class Meta:
        model = Grip
        fields = CommonInfoFilterset.FIELDS_BASE + [
            'uuid',
            'picksess',
            'robot_ids',
            'success',
            *LinkedReportHarvesterFilter.FIELDS,
            *LinkedReportStartEndFilter.FIELDS,
        ]
