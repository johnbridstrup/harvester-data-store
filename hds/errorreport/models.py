from django.db import models
from taggit.managers import TaggableManager
from common.models import ReportBase
from event.models import EventModelMixin
from location.models import Location
from harvester.models import Harvester

DEFAULT_UNKNOWN = "unknown"


class ErrorReport(EventModelMixin, ReportBase):
    """ ErrorReport Model """
    location = models.ForeignKey(Location, on_delete=models.CASCADE, related_name='errorlocation')
    harvester = models.ForeignKey(Harvester, on_delete=models.CASCADE, related_name='errorharvester')
    githash = models.CharField(max_length=20, default=DEFAULT_UNKNOWN)
    gitbranch = models.CharField(max_length=50, default=DEFAULT_UNKNOWN)
    tags = TaggableManager()

    def __str__(self):
        excs = [f"\n\t{str(exc)}" for exc in self.exceptions.all()]
        return (
            f"*Error on Harvester {self.harvester.harv_id}*\n"
            f"ts: {self.reportTime}\n"
            f"Exceptions: {''.join(excs)}\n"
            f"Location: {self.location.ranch}\n"
        )
