from django.db import models
from django_celery_beat.models import PeriodicTask
from simple_history.models import HistoricalRecords

from common.models import CommonInfo
from harvester.models import Harvester
from harvjobs.models import Job


class ScheduledJob(CommonInfo):
    """Scheduled Job model.

    This model fascilitates an API for scheduling jobs on harvesters with 
    the job server framework. It is essentially a through model for the 
    celery PeriodicTask definition, intended harvester targets, and Job
    definitions.
    """
    class SchedJobStatusChoices(models.TextChoices):
        PENDING = "pending"
        WAITING = "waiting to schedule"
        SCHEDULED = "scheduled"
        CANCELLED = "cancelled"
        RESCHEDWAITING = "waiting to re-schedule"
        SCHEDFAIL = "failed to schedule"
        MAXRUNS = "Max runs reached"

    task = models.OneToOneField(PeriodicTask, on_delete=models.CASCADE, null=True, blank=True)
    targets = models.ManyToManyField(Harvester)
    job_def = models.JSONField()
    jobs = models.ManyToManyField(Job, blank=True)
    schedule_status = models.CharField(max_length=63, choices=SchedJobStatusChoices.choices, default=SchedJobStatusChoices.PENDING)
    history = HistoricalRecords()
    num_runs = models.IntegerField(default=0)
    max_runs = models.IntegerField(default=10)  # negative is no max
    