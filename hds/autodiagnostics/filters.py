from django_filters import rest_framework as filters

from common.filters import ListFilter, HDSFilterset
from common.reports import DEFAULT_TZ, DTimeFormatter
from .models import AutodiagnosticsRun


class AutodiagnosticsRunFilter(HDSFilterset):
    # Special method filters
    datetime_range = filters.CharFilter(field_name="run_timestamp", method="filter_datetime") # start,end
    result = filters.CharFilter(field_name="result", method="filter_bool")
    template_match_result = filters.CharFilter(field_name="template_match_result", method="filter_bool")
    ball_found_result = filters.CharFilter(field_name="ball_found_result", method="filter_bool")

    # Comma separated lists
    gripper_sns = ListFilter(field_name="gripper__serial_number")
    harv_ids = ListFilter(field_name="report__harvester__harv_id")

    # We can potentially add more complex filters like min_vac > X

    class Meta:
        model = AutodiagnosticsRun
        fields = (
            'robot_id',
            'report__harvester__location__ranch',
        )
