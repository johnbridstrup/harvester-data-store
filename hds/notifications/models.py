from common.models import CommonInfo

from django.contrib.auth.models import User
from django.db import models

class Notification(CommonInfo):
    trigger_on = models.TextField()
    recipients = models.ManyToManyField(User, related_name="user_notifications")
    criteria = models.JSONField()

    def __str__(self):
        return (
            f"Notify {', '.join([u.username for u in self.recipients.all()])} " 
            f"when {self.trigger_on} has {self.criteria}"
        )

    def notify(self, message):
        pass