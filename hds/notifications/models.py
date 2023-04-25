from django.contrib.auth.models import User
from django.db import models

from common.models import CommonInfo
from .slack import post_to_slack

class Notification(CommonInfo):
    trigger_on = models.TextField()
    recipients = models.ManyToManyField(User, related_name="user_notifications")
    criteria = models.JSONField()

    def __str__(self):
        return (
            f"Notify {', '.join([u.username for u in self.recipients.all()])} " 
            f"when {self.trigger_on} has {self.criteria}"
        )

    def notify(self, message, url):
        user_ids = []
        for user in self.recipients.all():
            if user.profile.slack_id:
                user_ids.append(f"<@{user.profile.slack_id}>")

        if len(user_ids) > 0:
            user_id_str = ', '.join(user_ids) + '\n'
            message += user_id_str
        message += f"{url}\n"
        
        post_to_slack(message)
        
