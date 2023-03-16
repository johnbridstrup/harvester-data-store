from django_filters import rest_framework as filters
from django_filters import Filter

from common.reports import DTimeFormatter, DEFAULT_TZ


class ListFilter(Filter):
    def __init__(self, field_type=str, field_name=None, lookup_expr=None, *, label=None, method=None, distinct=False, exclude=False, **kwargs):
        self.field_type = field_type
        super().__init__(field_name, lookup_expr, label=label, method=method, distinct=distinct, exclude=exclude, **kwargs)
    
    def filter(self, qs, value):
        if not value:
            return qs
        
        self.lookup_expr = "in"
        values = [self.field_type(v) for v in value.split(',')]
        return super().filter(qs, values)


class DTimeFilter(Filter):
    def filter(self, qs, value):
        if not value:
            return qs
        tz = self.parent.request.query_params.get("tz", DEFAULT_TZ)
        try:
            value = DTimeFormatter.convert_to_datetime(value, tz)
        except:
            return qs
        return super().filter(qs, value)


class GenericFilter(Filter):
    """Generic lookup filter.

    Filter any fields for exact matches. JSONField compatible. 
    example: client.get(<url>/?jsonfield__key1__key2=3,jsonfield2__key3__key4=hello)
    """
    def filter(self, qs, value):
        if not value:
            return qs
        query_filter = {}
        for item in value.split(','):
                try:
                    key, value = item.split('=')
                except ValueError:
                    # too many or not enough values to unpack
                    return qs
                query_filter[key.strip()] = value.strip()
        
        return qs.filter(**query_filter)

        


class CommonInfoFilterset(filters.FilterSet):
    FIELDS_BASE = [
        'created_after', 
        'created_before',
    ]

    created_after = DTimeFilter(field_name='created', lookup_expr='gte')
    created_before = DTimeFilter(field_name='created', lookup_expr='lte')

    def filter_datetime_range(self, queryset, name, value):
        split_dates = value.split(',')
        if len(split_dates) != 2:
            return queryset
        
        filter_dict = {}
        tz = self.request.query_params.get("tz", DEFAULT_TZ)
        start_str = split_dates[0]
        end_str = split_dates[1]
        if start_str:
            start = DTimeFormatter.convert_to_datetime(start_str, tz)
            filter_dict[f"{name}__gte"] = start
        if end_str:
            end = DTimeFormatter.convert_to_datetime(end_str, tz)
            filter_dict[f"{name}__lte"] = end
        return queryset.filter(**filter_dict)


class ReportFilterset(CommonInfoFilterset):
    FIELDS_BASE = CommonInfoFilterset.FIELDS_BASE + [
        "reporttime_after",
        "reporttime_before",
        "locations",
        "harv_ids",
        "fruits"
    ]

    reporttime_after = DTimeFilter(field_name='reportTime', lookup_expr='gte')
    reporttime_before = DTimeFilter(field_name='reportTime', lookup_expr='lte')
    locations = ListFilter(field_name="location__ranch")
    harv_ids = ListFilter(field_type=int, field_name="harvester__harv_id")
    fruits = ListFilter(field_name="harvester__fruit__name")
