from django.db import models
from simple_history.models import HistoricalRecords

from common.models import CommonInfo
from common.reports import ReportBase
from event.models import EventModelMixin
from harvester.models import Harvester

from .dynamic_keys import ALLOW_REPEAT_KEY, DYN_KEY_LIST_KEY


class JobType(CommonInfo):
    name = models.CharField(max_length=20, unique=True)

    def __str__(self):
        return f"Job Type: {self.name}"


class JobSchema(CommonInfo):
    jobtype = models.ForeignKey(JobType, on_delete=models.CASCADE, related_name="schemas")
    schema = models.JSONField()
    version = models.CharField(max_length=10)
    comment = models.CharField(max_length=280, default="") # Twitter max char count should be enough

    class Meta:
        unique_together = ('jobtype', 'version')

    def __str__(self):
        return f"{self.jobtype.name} job type: version {self.version}"
    
    @property
    def dynamic_keys_list(self):
        return self.schema.get(DYN_KEY_LIST_KEY, [])
    
    @property
    def allows_repeats(self):
        return self.schema.get(ALLOW_REPEAT_KEY, False)
    
    @property
    def is_dynamic(self):
        return len(self.dynamic_keys_list) > 0 and self.allows_repeats


class Job(EventModelMixin, CommonInfo):
    class StatusChoices(models.TextChoices):
        SUCCESS = "Success"
        FAIL = "Failed"
        PENDING = "Pending"
        ERROR = "Error"
        FAILERROR = "Failed and errors"
        UNSENT = "Failed to send"
        CANCELED = "canceled"

    schema = models.ForeignKey(JobSchema, on_delete=models.CASCADE, related_name="jobs")
    target = models.ForeignKey(Harvester, on_delete=models.CASCADE, related_name="jobs")
    payload = models.JSONField()
    jobstatus = models.CharField(
        choices=StatusChoices.choices,
        default=StatusChoices.PENDING,
        max_length=30,
    )
    history = HistoricalRecords()

    def __str__(self) -> str:
        return f"{self.schema.jobtype.name} job on {self.target.name}: {self.jobstatus}"


class JobResults(EventModelMixin, ReportBase):
    job = models.ForeignKey(Job, on_delete=models.CASCADE, related_name="results", null=True, blank=True)

    def __str__(self):
        return f"{self.job.schema.version} job {self.event.UUID}: {self.job.jobstatus}"


class JobHostResult(CommonInfo):
    class JobResult(models.TextChoices):
        FAIL = "Failed"
        SUCCESS = "Success"
        ERROR = "Error"
        CANCELED = "canceled"


    parent = models.ForeignKey(JobResults, on_delete=models.CASCADE, related_name="host_results")
    host = models.CharField(max_length=30)
    result = models.CharField(choices=JobResult.choices, max_length=30)
    details = models.JSONField()
    timestamp = models.DateTimeField()
