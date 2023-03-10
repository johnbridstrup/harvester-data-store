from django_filters import rest_framework as filters

from common.filters import ListFilter, CommonInfoFilterset
from common.reports import DEFAULT_TZ, DTimeFormatter
from .models import AFTException


class AFTExceptionFilter(CommonInfoFilterset):
    # Special method filters
    datetime_range = filters.CharFilter(field_name="timestamp", method="filter_datetime_range") # start,end
    is_emulator = filters.CharFilter(field_name="is_emulator", method="filter_bool")
    handled = filters.CharFilter(field_name="handled", method="filter_bool")

    # Comma separated lists
    harv_ids = ListFilter(field_name="report__harvester__harv_id") # 10,11,9,2,...
    codes = ListFilter(field_name="code__code")
    locations = ListFilter(field_name='report__location__ranch')
    fruits = ListFilter(field_name='report__harvester__fruit__name')

    # Standard Filters
    traceback = filters.CharFilter(field_name="traceback", lookup_expr="icontains")

    class Meta:
        model = AFTException
        fields = (
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
        )
