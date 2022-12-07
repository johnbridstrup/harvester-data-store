from django.db import models

from common.models import ReportBase
from harvester.models import Harvester
from location.models import Location
from event.models import EventModelMixin


class AutodiagnosticsReport(EventModelMixin, ReportBase):
    location = models.ForeignKey(Location, on_delete=models.SET_NULL, null=True, blank=True)
    harvester = models.ForeignKey(Harvester, on_delete=models.CASCADE)
    result = models.BooleanField()
    robot = models.IntegerField()
    gripper_sn = models.IntegerField()
