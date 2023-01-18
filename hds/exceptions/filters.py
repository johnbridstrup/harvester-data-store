from django_filters import rest_framework as filters

from common.filters import ListFilter
from common.reports import DEFAULT_TZ, DTimeFormatter
from .models import AFTException


class AFTExceptionFilter(filters.FilterSet):
    # Special method filters
    datetime_range = filters.CharFilter(method="filter_datetime") # start,end
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

    def filter_datetime(self, queryset, name, value):
        split_dates = value.split(',')
        if len(split_dates) != 2:
            return queryset
        
        filter_dict = {}
        tz = self.request.query_params.get("tz", DEFAULT_TZ)
        start_str = split_dates[0]
        end_str = split_dates[1]
        if start_str:
            start = DTimeFormatter.convert_to_datetime(start_str, tz)
            filter_dict[f"timestamp__gte"] = start
        if end_str:
            end = DTimeFormatter.convert_to_datetime(end_str, tz)
            filter_dict[f"timestamp__lte"] = end
        return queryset.filter(**filter_dict)

    def filter_bool(self, queryset, name, value):
        # This should probably be handled more elegantly
        value = value.lower() in ["1", "true"]
        return queryset.filter(is_emulator=value)
