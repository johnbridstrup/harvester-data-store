from common.models import CommonInfo, ReportBase
from event.models import EventModelMixin
from harvester.models import Harvester

from django.db import models
from simple_history.models import HistoricalRecords


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


class Job(EventModelMixin, CommonInfo):
    class StatusChoices(models.TextChoices):
        SUCCESS = "Success"
        FAIL = "Failed"
        PENDING = "Pending"
        ERROR = "Error"
        FAILERROR = "Failed and errors"
        UNSENT = "Failed to send"

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

    parent = models.ForeignKey(JobResults, on_delete=models.CASCADE, related_name="host_results")
    host = models.CharField(max_length=30)
    result = models.CharField(choices=JobResult.choices, max_length=30)
    details = models.JSONField()
    timestamp = models.DateTimeField()
