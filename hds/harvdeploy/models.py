from collections.abc import Mapping, Iterable
from django.db import models
from taggit.managers import TaggableManager

from common.models import CommonInfo
from common.reports import ReportBase
from harvester.models import Fruit

class HarvesterCodeRelease(CommonInfo):
    version = models.CharField(max_length=40)
    release = models.JSONField()
    fruit = models.ForeignKey(Fruit, on_delete=models.CASCADE)
    tags = TaggableManager()

    class Meta:
        unique_together = ("version", "fruit")


class HarvesterVersionReport(ReportBase):
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

    @property
    def conflicts(self):
        # Check to see if there are errors or conflicts between the version
        # and the expected release
        release = self.harvester.release
        if release is None:
            return {"error": "No release"}

        release_vers = release.version
        conflicts = {}
        for hostname, host_report in self.report["data"].items():
            if not isinstance(host_report, Mapping):
                continue

            error = host_report.get("error", None)
            if error is not None:
                conflicts[hostname] = host_report
                continue

            version = host_report.get("version")
            if str(version) != str(release_vers):
                conflicts[hostname] = host_report
        return conflicts
