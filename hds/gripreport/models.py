from django.db import models

from common.models import CommonInfo
from common.reports import ReportBase
from event.models import PickSessionModelMixin
from harvester.models import Fruit, Harvester
from location.models import Location


class GripReport(PickSessionModelMixin, ReportBase):
    def __str__(self):
        return f"Grip report: {self.reportTime}"
    

class Candidate(CommonInfo):
    report = models.ForeignKey(GripReport, on_delete=models.CASCADE)
    fruit = models.ForeignKey(Fruit, on_delete=models.CASCADE)
    harvester = models.ForeignKey(Harvester, on_delete=models.CASCADE)
    location = models.ForeignKey(Location, on_delete=models.CASCADE)
    robot_id  = models.IntegerField()
    score = models.FloatField()
    ripeness = models.FloatField()
    cand_id = models.IntegerField()
    candidate_data = models.JSONField()
    

class Grip(CommonInfo):
    report = models.ForeignKey(GripReport, on_delete=models.CASCADE)
    fruit = models.ForeignKey(Fruit, on_delete=models.CASCADE)
    harvester = models.ForeignKey(Harvester, on_delete=models.CASCADE)
    location = models.ForeignKey(Location, on_delete=models.CASCADE)
    candidate = models.ForeignKey(Candidate, on_delete=models.CASCADE)
    success = models.BooleanField(default=False, db_index=True)
    robot_id = models.IntegerField()
    grip_start_ts = models.FloatField()
    grip_end_ts = models.FloatField()
    pick_result = models.CharField(max_length=255, blank=True, null=True)
    pick_result_dirty = models.BooleanField(default=False)
    grip_result = models.CharField(max_length=255, blank=True, null=True)
    grip_result_dirty = models.BooleanField(default=False)
    grip_data = models.JSONField()

    @property
    def grip_duration(self):
        return self.grip_end_ts - self.grip_start_ts
