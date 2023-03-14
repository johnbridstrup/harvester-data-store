from django_filters import rest_framework as filters
from common.filters import DTimeFilter, ListFilter, ReportFilterset

from .models import ErrorReport


class ErrorReportFilterset(ReportFilterset):
    harv_ids = ListFilter(field_type=int, field_name='harvester__harv_id')
    start_time = DTimeFilter("reportTime", lookup_expr="gte")
    end_time = DTimeFilter("reportTime", lookup_expr="lte")
    traceback = filters.CharFilter(field_name="exceptions__traceback", lookup_expr="icontains")
    is_emulator = filters.BooleanFilter(field_name="harvester__is_emulator")
    handled = filters.BooleanFilter(field_name="exceptions__handled")

    class Meta:
        model = ErrorReport
        fields = ReportFilterset.FIELDS_BASE + []
