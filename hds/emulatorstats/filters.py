from django_filters import rest_framework as filters

from common.filters import GenericFilter, EventUUIDFilter, ReportFilterset
from .models import EmustatsReport


class EmustatsReportFilter(ReportFilterset):
    datetime_range = filters.CharFilter(
        field_name="reportTime", method="filter_datetime_range"
    )  # start,end
    uuid = EventUUIDFilter(field_name="event")
    site_name = filters.CharFilter(field_name="report__data__site_name")
    generic = GenericFilter()

    class Meta:
        model = EmustatsReport
        fields = ReportFilterset.FIELDS_BASE + [
            "runner",
            "branch",
        ]
