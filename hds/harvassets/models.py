from django.db import models
from simple_history.models import HistoricalRecords

from common.models import CommonInfo
from common.reports import ReportBase
from event.models import EventModelMixin
from harvester.models import Harvester


class HarvesterAssetReport(EventModelMixin, ReportBase):
    def __str__(self):
        return f"Harv {self.harvester.harv_id} asset report"


class HarvesterAssetType(CommonInfo):
    name = models.CharField(max_length=31, unique=True)

    def __str__(self):
        return self.name


class HarvesterAsset(CommonInfo):
    history = HistoricalRecords()
    asset = models.ForeignKey(HarvesterAssetType, on_delete=models.CASCADE, related_name="assets")
    harvester = models.ForeignKey(Harvester, on_delete=models.SET_NULL, null=True, blank=True, related_name="assets")
    index = models.IntegerField()
    serial_number = models.CharField(max_length=63)
    version = models.CharField(max_length=31, null=True, blank=True)

    class Meta:
        unique_together = ('asset', 'serial_number',)
