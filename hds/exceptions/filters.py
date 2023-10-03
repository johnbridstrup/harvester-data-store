from django_filters import rest_framework as filters

from common.filters import (
    DTimeFilter,
    EventUUIDFilter,
    GenericFilter,
    ListFilter,
    CommonInfoFilterset
)
from .models import AFTException


class AFTExceptionFilter(CommonInfoFilterset):
    # Exception filters
    datetime_range = filters.CharFilter(field_name="timestamp", method="filter_datetime_range") # start,end
    handled = filters.BooleanFilter(field_name="handled")
    codes = ListFilter(field_name="code__code")
    traceback = filters.CharFilter(field_name="traceback", lookup_expr="icontains")

    # Report Filters
    harv_ids = ListFilter(field_name="report__harvester__harv_id")
    locations = ListFilter(field_name='report__location__ranch')
    fruits = ListFilter(field_name='report__harvester__fruit__name')
    uuid = EventUUIDFilter(field_name="report__event")
    start_time = DTimeFilter("timestamp", lookup_expr="gte")
    end_time = DTimeFilter("timestamp", lookup_expr="lte")
    is_emulator = filters.BooleanFilter(field_name="report__harvester__is_emulator")
    generic = GenericFilter(foreign_key_prefix="report")
    start_hour = DTimeFilter(field_name="timestamp", method="filter_time_of_day")
    end_hour = DTimeFilter(field_name="timestamp", method="filter_time_of_day")

    class Meta:
        model = AFTException
        fields = CommonInfoFilterset.FIELDS_BASE + [
            'primary',
            'code__code',
            'code__name',
            'code__team',
            'code__cycle',
            'service',
            'node',
            'robot',
            'report__harvester__harv_id',
            'report__harvester__location__ranch',
        ]
