from django.db import models
from common.models import CommonInfo


class MigrationLog(CommonInfo):
    class ResultChoices(models.TextChoices):
        FAIL = "failed"
        PENDING = "pending"
        SUCCESS = "success"
    
    result = models.CharField(choices=ResultChoices.choices, default=ResultChoices.PENDING, max_length=31)
    startTime = models.DateTimeField(null=True) # Null allowed since this will be started by a task
    endTime = models.DateTimeField(null=True)
    output = models.TextField(null=True)
    githash = models.CharField(max_length=40)

    @property
    def duration(self):
        duration = self.endTime - self.startTime
        return duration.total_seconds()

    def __str__(self):
        if self.startTime:
            if self.endTime:
                return f"Migration {self.id} ({self.result}): Finished in {self.duration} seconds."
            return f"Migration {self.id}: Unfinished! Started {self.startTime}"
        return f"Migration {self.id}: Unknown error"
