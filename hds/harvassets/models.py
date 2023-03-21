from django.db import models
from django.utils import timezone
from simple_history.models import HistoricalRecords

from common.models import CommonInfo
from common.reports import ReportBase
from event.models import EventModelMixin
from harvester.models import Harvester

from .metrics import HarvAssetMonitor


class HarvesterAssetReport(EventModelMixin, ReportBase):
    def __str__(self):
        return f"Harv {self.harvester.harv_id} asset report"


class HarvesterAssetType(CommonInfo):
    name = models.CharField(max_length=31, unique=True)

    def __str__(self):
        return self.name

    @staticmethod
    def get_or_create(asset_type, user):
        try:
            asset_type_obj = HarvesterAssetType.objects.get(name=asset_type)
        except HarvesterAssetType.DoesNotExist:
            # create asset type and asset, then continue loop
            asset_type_obj = HarvesterAssetType.objects.create(creator=user, name=asset_type)
        return asset_type_obj


class HarvesterAsset(CommonInfo):
    history = HistoricalRecords()
    asset = models.ForeignKey(HarvesterAssetType, on_delete=models.CASCADE, related_name="assets")
    harvester = models.ForeignKey(Harvester, on_delete=models.SET_NULL, null=True, blank=True, related_name="assets")
    index = models.IntegerField()
    serial_number = models.CharField(max_length=63)
    version = models.CharField(max_length=31, null=True, blank=True)

    class Meta:
        unique_together = ('asset', 'serial_number',)

    def clear_harv(self):
        HarvAssetMonitor.removed_from_harvester(self)
        self.harvester = None
        self.save()

    @classmethod
    def update_or_create_and_get(cls, asset_type_obj, harv, index, serial_number, user, version=None):
        # Clear asset of this type at this index on this harv.
        # We have to consider there being multiple for now, it can be changed later.
        exist_at_index = cls.objects.filter(asset=asset_type_obj, harvester=harv, index=index)
        for existing in exist_at_index:
            existing.clear_harv()
            HarvAssetMonitor.removed_from_harvester(existing)

        try:
            asset_obj = HarvesterAsset.objects.get(asset=asset_type_obj, serial_number=serial_number)
            asset_obj.harvester = harv
            asset_obj.index = index
            asset_obj.lastModified = timezone.now()
            asset_obj.modifiedBy = user
            if version is not None:
                asset_obj.version = version
                HarvAssetMonitor.version_update(asset_obj)
            asset_obj.save()
        
        except HarvesterAsset.DoesNotExist:
            asset = {
                "harvester": harv,
                "index": index,
                "serial_number": serial_number,
                "asset": asset_type_obj,
                "creator": user,
            }
            if version is not None:
                asset["version"] = version
            asset_obj = HarvesterAsset.objects.create(**asset)

        HarvAssetMonitor.set_gauges(asset_obj)
        return asset_obj
        