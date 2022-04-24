from django.db import models
from common.models import CommonInfo
from location.models import Location
from harvester.models import Harvester


class ReportBase(CommonInfo):
    """ ReportBase Model """
    reportTime = models.DateTimeField(blank=True, null=True)
    report = models.JSONField(blank=True, null=True)

    class Meta:
        abstract = True


class ErrorReport(ReportBase):
    """ ErrorReport Model """
    location = models.ForeignKey(Location, on_delete=models.CASCADE, related_name='errorlocation')
    harvester = models.ForeignKey(Harvester, on_delete=models.CASCADE, related_name='errorharvester')

