from django_filters import rest_framework as filters

from common.filters import (
    DTimeFilter,
    EventUUIDFilter,
    LinkedReportHarvesterFilter,
    ListFilter,
    CommonInfoFilterset,
    ReportFilterset,
)
from .models import AutodiagnosticsRun, AutodiagnosticsReport


class AutodiagnosticsRunFilter(
    CommonInfoFilterset, LinkedReportHarvesterFilter
):
    # Special method filters
    datetime_range = filters.CharFilter(
        field_name="run_timestamp", method="filter_datetime_range"
    )  # start,end
    start_time = DTimeFilter(field_name="run_timestamp", lookup_expr="gte")
    end_time = DTimeFilter(field_name="run_timestamp", lookup_expr="lte")

    # Comma separated lists
    gripper_sns = ListFilter(field_name="gripper__serial_number")

    # Autodiag filters
    result = filters.BooleanFilter(field_name="result")
    template_match_result = filters.BooleanFilter(
        field_name="template_match_result"
    )
    ball_found_result = filters.BooleanFilter(field_name="ball_found_result")
    min_vac_gte = filters.NumberFilter(field_name="min_vac", lookup_expr="gte")
    min_vac_lte = filters.NumberFilter(field_name="min_vac", lookup_expr="lte")
    finger_delta_gte = filters.NumberFilter(
        field_name="finger_delta", lookup_expr="gte"
    )
    template_y_match_error_gte = filters.NumberFilter(
        field_name="template_y_match_error", lookup_expr="gte"
    )
    template_y_match_error_lte = filters.NumberFilter(
        field_name="template_y_match_error", lookup_expr="lte"
    )

    uuid = EventUUIDFilter(field_name="report__event")

    class Meta:
        model = AutodiagnosticsRun
        fields = CommonInfoFilterset.FIELDS_BASE + [
            "robot_id",
            "report__harvester__location__ranch",
            *LinkedReportHarvesterFilter.FIELDS,
        ]


class AutodiagnosticsReportFilter(ReportFilterset):
    harv_id = filters.CharFilter(field_name="harvester__harv_id")
    ranch = filters.CharFilter(field_name="location__ranch")
    result = filters.BooleanFilter(field_name="result")
    robot = filters.NumberFilter(field_name="robot")
    gripper_sn = filters.NumberFilter(field_name="gripper_sn")
    uuid = EventUUIDFilter()

    class Meta:
        model = AutodiagnosticsReport
        fields = ReportFilterset.FIELDS_BASE
