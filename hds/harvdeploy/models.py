from common.models import CommonInfo, ReportBase
from harvester.models import Fruit, Harvester

from django.db import models
from collections.abc import Mapping, Iterable

class HarvesterCodeRelease(CommonInfo):
    version = models.CharField(max_length=40)
    release = models.JSONField()
    fruit = models.ForeignKey(Fruit, on_delete=models.CASCADE)

    class Meta:
        unique_together = ("version", "fruit")


class HarvesterVersionReport(ReportBase):
    harvester = models.ForeignKey(Harvester, on_delete=models.CASCADE, related_name="version_history")
    is_dirty = models.BooleanField()

    @classmethod
    def check_dirty(cls, input_versions):
        # Check if any computers have dirty packages
        versions = input_versions.copy()

        for v in versions.values():
            if isinstance(v, Mapping):
                dirty = v.get("dirty", None)
                if isinstance(dirty, Iterable):
                    if len(dirty) > 0:
                        return True
                elif dirty is not None:
                    return True
        return False

    @classmethod
    def is_duplicate_version(cls, incoming_vers, last_vers):
        # Right now this just checks if an incoming version
        # from a harvester is identical to the current version
        # stored for that harvester.
        return incoming_vers == last_vers
