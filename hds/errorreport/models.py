from django.db import models
from common.models import ReportBase
from location.models import Location
from harvester.models import Harvester


class ErrorReport(ReportBase):
    """ ErrorReport Model """
    location = models.ForeignKey(Location, on_delete=models.CASCADE, related_name='errorlocation')
    harvester = models.ForeignKey(Harvester, on_delete=models.CASCADE, related_name='errorharvester')
