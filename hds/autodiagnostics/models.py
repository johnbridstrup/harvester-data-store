from django.db import models

from common.models import CommonInfo
from common.reports import ReportBase
from event.models import PickSessionModelMixin
from harvassets.models import HarvesterAsset


class AutodiagnosticsReport(PickSessionModelMixin, ReportBase):
    result = models.BooleanField()
    robot = models.IntegerField()
    gripper_sn = models.IntegerField()


class AutodiagnosticsRun(CommonInfo):
    report = models.OneToOneField(
        AutodiagnosticsReport, on_delete=models.CASCADE, related_name="run_data"
    )
    gripper = models.ForeignKey(HarvesterAsset, on_delete=models.CASCADE)
    robot_id = models.IntegerField()
    run_timestamp = models.DateTimeField()
    ball_found_result = models.BooleanField()
    result = models.BooleanField()

    # ALL of these will be null if ball_found_result is False
    template_match_result = models.BooleanField(null=True, blank=True)
    min_vac = models.FloatField(null=True, blank=True)
    finger_open_value = models.FloatField(null=True, blank=True)
    finger_closed_value = models.FloatField(null=True, blank=True)
    finger_delta = models.FloatField(null=True, blank=True)
    nominal_touch_force = models.FloatField(null=True, blank=True)
    max_touch_force = models.FloatField(null=True, blank=True)
    template_match_y_error = models.FloatField(null=True, blank=True)
    sensors = models.JSONField(null=True, blank=True)
