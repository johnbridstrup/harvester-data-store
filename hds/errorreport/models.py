from django.db import models
from common.models import ReportBase
from event.models import EventModelMixin
from exceptions.utils import sort_exceptions
from location.models import Location
from harvester.models import Harvester

DEFAULT_UNKNOWN = "unknown"


class ErrorReport(EventModelMixin, ReportBase):
    """ ErrorReport Model """
    location = models.ForeignKey(Location, on_delete=models.CASCADE, related_name='errorlocation')
    harvester = models.ForeignKey(Harvester, on_delete=models.CASCADE, related_name='errorharvester')
    githash = models.CharField(max_length=20, default=DEFAULT_UNKNOWN)
    gitbranch = models.CharField(max_length=50, default=DEFAULT_UNKNOWN)

    def __str__(self):
        excs = sort_exceptions(self.exceptions.all())
        excs = [f"\n\t{str(exc)}" for exc in excs]
        return (
            f"*Error on Harvester {self.harvester.harv_id}*\n"
            f"ts: {self.reportTime}\n"
            f"Exceptions: {''.join(excs)}\n"
            f"Location: {self.location.ranch}\n"
        )
