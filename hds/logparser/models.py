import os
from django.db import models
from django.conf import settings
from taggit.models import TaggedItemBase
from taggit.managers import TaggableManager
from common.models import CommonInfo
from harvester.models import Harvester
from s3file.models import S3File


TIMEZONE="US/Pacific"


def media_upload_path(instance, filename):
    """save media file to custom path."""
    username = instance.creator.username
    if settings.USES3:
        return os.path.join("uploads", username, filename)
    return f"uploads/{filename}"


class LogSession(CommonInfo):
    name = models.CharField(max_length=255, unique=True)
    date_time = models.DateTimeField(blank=True, null=True)
    harv = models.ForeignKey(Harvester, on_delete=models.SET_NULL, blank=True, null=True)
    zip_file = models.FileField(upload_to=media_upload_path, blank=True, null=True)
    tags = TaggableManager(through='LogTag')

    def __str__(self):
        return self.name


class LogFile(CommonInfo):
    file_name = models.CharField(max_length=100)
    service = models.CharField(max_length=50)
    robot = models.IntegerField()
    content = models.JSONField(default=list)
    log_session = models.ForeignKey(LogSession, on_delete=models.CASCADE, related_name="logfile")

    def __str__(self):
        return self.file_name


class LogVideo(CommonInfo):
    file_name = models.CharField(max_length=100)
    robot = models.IntegerField()
    category = models.CharField(max_length=100)
    meta = models.JSONField(default=list)
    log_session = models.ForeignKey(LogSession, on_delete=models.CASCADE, related_name="logvideo")
    video_avi = models.FileField(upload_to=media_upload_path, blank=True, null=True)

    def __str__(self):
        return self.file_name


class LogTag(TaggedItemBase):
    content_object = models.ForeignKey(LogSession, on_delete=models.CASCADE)