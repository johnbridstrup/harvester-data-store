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


class HDSFilterset(filters.FilterSet):
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
            filter_dict[f"{name}__gte"] = start
        if end_str:
            end = DTimeFormatter.convert_to_datetime(end_str, tz)
            filter_dict[f"{name}__lte"] = end
        return queryset.filter(**filter_dict)

    def filter_bool(self, queryset, name, value):
        # This should probably be handled more elegantly
        value = value.lower() in ["1", "true"]
        return queryset.filter(**{name: value})
