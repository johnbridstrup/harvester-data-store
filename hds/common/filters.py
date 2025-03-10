import datetime
import pytz

from django_filters import rest_framework as filters
from django_filters import Filter

from common.reports import DTimeFormatter, DEFAULT_TZ


class ListFilter(Filter):
    def __init__(
        self,
        field_type=str,
        field_name=None,
        lookup_expr=None,
        *,
        label=None,
        method=None,
        distinct=False,
        exclude=False,
        **kwargs,
    ):
        self.field_type = field_type
        super().__init__(
            field_name,
            lookup_expr,
            label=label,
            method=method,
            distinct=distinct,
            exclude=exclude,
            **kwargs,
        )

    def filter(self, qs, value):
        if not value:
            return qs

        self.lookup_expr = "in"
        values = [self.field_type(v) for v in value.split(",")]
        return super().filter(qs, values).distinct()


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


class TagListFilter(Filter):
    def __init__(
        self,
        field_name="tags__name",
        lookup_expr=None,
        *,
        label=None,
        method=None,
        distinct=False,
        exclude=False,
        **kwargs,
    ):
        super().__init__(
            field_name=field_name,
            lookup_expr=lookup_expr,
            label=label,
            method=method,
            distinct=distinct,
            exclude=exclude,
            **kwargs,
        )

    """Filter by list of tags"""

    def filter(self, qs, value):
        if not value:
            return qs

        for val in value.split(","):
            filt = {f"{self.field_name}": val}
            qs = qs.filter(**filt)
        return qs


class GenericFilter(Filter):
    """Generic lookup filter.

    Filter any fields for exact matches. JSONField compatible.
    example: client.get(<url>/?jsonfield__key1__key2=3,jsonfield2__key3__key4=hello)
    """

    def __init__(
        self,
        field_name=None,
        lookup_expr=None,
        *,
        label=None,
        method=None,
        distinct=False,
        exclude=False,
        foreign_key_prefix=None,
        **kwargs,
    ):
        super().__init__(
            field_name,
            lookup_expr,
            label=label,
            method=method,
            distinct=distinct,
            exclude=exclude,
            **kwargs,
        )
        self.foreign_key_prefix = foreign_key_prefix

    def filter(self, qs, value):
        if not value:
            return qs
        query_filter = {}
        for item in value.split(","):
            try:
                key, value = item.split("=")
                key = (
                    f"{self.foreign_key_prefix}__{key}"
                    if self.foreign_key_prefix
                    else key
                )
            except ValueError:
                # too many or not enough values to unpack
                return qs
            query_filter[key.strip()] = value.strip()

        return qs.filter(**query_filter)


class EventUUIDFilter(ListFilter):
    def __init__(
        self,
        field_type=str,
        field_name="event",
        lookup_expr=None,
        *,
        label=None,
        method=None,
        distinct=False,
        exclude=False,
        **kwargs,
    ):
        super().__init__(
            field_type,
            field_name,
            lookup_expr,
            label=label,
            method=method,
            distinct=distinct,
            exclude=exclude,
            **kwargs,
        )

    def filter(self, qs, value):
        self.field_name += "__UUID"
        return super().filter(qs, value)


####################################################################################################
# Filter Mixins
####################################################################################################


class ReportStartEndFilter(filters.FilterSet):
    start_time = DTimeFilter(field_name="reportTime", lookup_expr="gte")
    end_time = DTimeFilter(field_name="reportTime", lookup_expr="lte")

    FIELDS = ["start_time", "end_time"]


class LinkedReportStartEndFilter(filters.FilterSet):
    start_time = DTimeFilter(field_name="report__reportTime", lookup_expr="gte")
    end_time = DTimeFilter(field_name="report__reportTime", lookup_expr="lte")

    FIELDS = ["start_time", "end_time"]


class HarvesterFilter(filters.FilterSet):
    harv_ids = ListFilter(field_type=int, field_name="harvester__harv_id")
    fruits = ListFilter(field_name="harvester__fruit__name")
    is_emulator = filters.BooleanFilter(field_name="harvester__is_emulator")

    FIELDS = ["harv_ids", "fruits", "is_emulator"]


class LinkedReportHarvesterFilter(filters.FilterSet):
    harv_ids = ListFilter(
        field_type=int, field_name="report__harvester__harv_id"
    )
    fruits = ListFilter(field_name="report__harvester__fruit__name")
    is_emulator = filters.BooleanFilter(
        field_name="report__harvester__is_emulator"
    )

    FIELDS = ["harv_ids", "fruits", "is_emulator"]


####################################################################################################
# Filtersets
####################################################################################################


class CommonInfoFilterset(filters.FilterSet):
    FIELDS_BASE = [
        "created_after",
        "created_before",
    ]

    created_after = DTimeFilter(field_name="created", lookup_expr="gte")
    created_before = DTimeFilter(field_name="created", lookup_expr="lte")

    def filter_datetime_range(self, queryset, name, value):
        split_dates = value.split(",")
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

    def filter_primary_exception(self, queryset, name, value):
        """
        Filters out errorreport with primary exceptions for the
        exceptions codes sent by the client.

        It is a hack that intercepts any reordering for exception code and
        boolean primary flag.
        """
        codes_str = self.request.query_params.get("codes", None)
        codes = codes_str.split(",") if codes_str else None

        filter_dict = {}
        if codes:
            filter_dict["exceptions__code__code__in"] = codes
        filter_dict.update({name: value})

        return queryset.filter(**filter_dict)

    def filter_time_of_day(self, queryset, name, value):
        """
        Filters out errorreport that occur at given time intervals hours
        e.g 3AM and 2PM
        """
        start_hour = self.request.query_params.get("start_hour", None)
        end_hour = self.request.query_params.get("end_hour", None)
        tz = pytz.timezone(self.request.query_params.get("tz", DEFAULT_TZ))
        filter_dict = {}

        # Create time objects for start hour
        if start_hour:
            start_hour = datetime.time(
                *DTimeFormatter.parse_time(start_hour), tzinfo=tz
            )
            filter_dict.update({f"{name}__time__gte": start_hour})
        if end_hour:
            end_hour = datetime.time(
                *DTimeFormatter.parse_time(end_hour), tzinfo=tz
            )
            filter_dict.update({f"{name}__time__lte": end_hour})
        return queryset.filter(**filter_dict)


class ReportFilterset(
    CommonInfoFilterset, ReportStartEndFilter, HarvesterFilter
):
    FIELDS_BASE = CommonInfoFilterset.FIELDS_BASE + [
        *ReportStartEndFilter.FIELDS,
        *HarvesterFilter.FIELDS,
        "locations",
    ]

    locations = ListFilter(field_name="location__ranch")
    tags = TagListFilter()
