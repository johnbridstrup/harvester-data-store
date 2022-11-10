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
    has_unexpected = models.BooleanField(default=False)

    @staticmethod
    def _check(input_versions, key):
        versions = input_versions.copy()

        for v in versions.values():
            if not isinstance(v, Mapping):
                continue
            
            check = v.get(key, None)
            if isinstance(check, Iterable):
                if len(check) > 0:
                    return True
            elif check is not None:
                return True
        return False

    @classmethod
    def check_dirty(cls, input_versions):
        # Check if any computers have dirty packages
        return cls._check(input_versions, "dirty")

    @classmethod
    def check_unexpected(cls, input_versions):
        # Check if there are unexpected packages
        return cls._check(input_versions, "unexpected")

    @classmethod
    def is_duplicate_version(cls, incoming_vers, last_vers):
        # Right now this just checks if an incoming version
        # from a harvester is identical to the current version
        # stored for that harvester.
        return incoming_vers == last_vers
