from django.db import models

from common.models import CommonInfo
from harvester.models import Harvester


class ChatbotLog(CommonInfo):
    class ChatbotLogType(models.TextChoices):
        IMAGE = "IMAGE", "Image"
        MESSAGE = "MESSAGE", "Message"

    class TextMessageType(models.TextChoices):
        INFO = "INFO", "Info"
        WARNING = "WARNING", "Warning"

    type = models.CharField(max_length=10, choices=ChatbotLogType.choices)
    subtype = models.CharField(
        max_length=10, choices=TextMessageType.choices, null=True, blank=True
    )
    harvester = models.ForeignKey(Harvester, on_delete=models.CASCADE)
    processed = models.BooleanField(default=False)
    channels = models.JSONField(null=True, blank=True)
    s3event = models.JSONField()
