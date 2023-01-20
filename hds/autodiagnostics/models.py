from django.db import models

from common.reports import ReportBase
from event.models import EventModelMixin


class AutodiagnosticsReport(EventModelMixin, ReportBase):
    result = models.BooleanField()
    robot = models.IntegerField()
    gripper_sn = models.IntegerField()
