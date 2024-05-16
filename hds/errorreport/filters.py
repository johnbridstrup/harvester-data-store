from django_filters import rest_framework as filters
from common.filters import (
    DTimeFilter,
    EventUUIDFilter,
    GenericFilter,
    ListFilter,
    ReportFilterset,
)

from .models import ErrorReport


class ErrorReportFilterset(ReportFilterset):
    traceback = filters.CharFilter(
        field_name="exceptions__traceback", lookup_expr="icontains"
    )
    handled = filters.BooleanFilter(field_name="exceptions__handled")
    codes = ListFilter(field_type=int, field_name="exceptions__code__code")
    primary = filters.BooleanFilter(
        field_name="exceptions__primary", method="filter_primary_exception"
    )
    start_hour = DTimeFilter("reportTime", method="filter_time_of_day")
    end_hour = DTimeFilter("reportTime", method="filter_time_of_day")
    generic = GenericFilter()
    uuid = EventUUIDFilter()

    class Meta:
        model = ErrorReport
        fields = ReportFilterset.FIELDS_BASE + []
