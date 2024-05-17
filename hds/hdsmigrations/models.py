from django.db import models
from django.utils.timezone import datetime, make_aware
from common.models import CommonInfo


class MigrationLog(CommonInfo):
    class ResultChoices(models.TextChoices):
        FAIL = "failed"
        PENDING = "pending"
        SUCCESS = "success"

    result = models.CharField(
        choices=ResultChoices.choices,
        default=ResultChoices.PENDING,
        max_length=31,
    )
    startTime = models.DateTimeField(
        null=True
    )  # Null allowed since this will be started by a task
    endTime = models.DateTimeField(null=True)
    output = models.TextField(null=True)
    githash = models.CharField(max_length=40)

    @property
    def duration(self):
        duration = self.endTime - self.startTime
        return duration.total_seconds()

    def _update(self, output):
        self.endTime = make_aware(datetime.now())
        self.output = output

    def log_fail(self, output):
        self._update(output)
        self.result = MigrationLog.ResultChoices.FAIL
        self.save()

    def log_success(self, output):
        self._update(output)
        self.result = MigrationLog.ResultChoices.SUCCESS
        self.save()

    def __str__(self):
        if self.startTime:
            if self.endTime:
                return f"Migration {self.id} ({self.result}): Finished in {self.duration} seconds."
            return f"Migration {self.id}: Unfinished! Started {self.startTime}"
        return f"Migration {self.id}: Unknown error"
