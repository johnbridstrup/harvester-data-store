from django_filters import rest_framework as filters

from common.filters import DTimeFilter, EventUUIDFilter, ReportFilterset
from .models import EmustatsReport


class EmustatsReportFilter(ReportFilterset):
    # Exception filters
    datetime_range = filters.CharFilter(field_name="timestamp", method="filter_datetime_range") # start,end

    # Report Filters
    uuid = EventUUIDFilter(field_name="report__event")
    start_time = DTimeFilter("timestamp", lookup_expr="gte")
    end_time = DTimeFilter("timestamp", lookup_expr="lte")

    class Meta:
        model = EmustatsReport
        fields = ReportFilterset.FIELDS_BASE + [
            'runner',
            'branch',
        ]
