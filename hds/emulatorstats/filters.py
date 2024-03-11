from django_filters import rest_framework as filters

from common.filters import DTimeFilter, EventUUIDFilter, ReportFilterset
from .models import EmustatsReport


class EmustatsReportFilter(ReportFilterset):
    datetime_range = filters.CharFilter(field_name="reportTime", method="filter_datetime_range") # start,end
    uuid = EventUUIDFilter(field_name="event")

    class Meta:
        model = EmustatsReport
        fields = ReportFilterset.FIELDS_BASE + [
            'runner',
            'branch',
        ]
