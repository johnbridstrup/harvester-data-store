from django.db import models

from common.reports import ReportBase
from event.models import PickSessionModelMixin


class AutodiagnosticsReport(PickSessionModelMixin, ReportBase):
    result = models.BooleanField()
    robot = models.IntegerField()
    gripper_sn = models.IntegerField()
