from django.db import models
from taggit.models import TaggedItemBase
from taggit.managers import TaggableManager
from common.models import CommonInfo
from common.utils import media_upload_path
from harvester.models import Harvester
from s3file.models import S3File, SessClip
from event.models import Event


TIMEZONE="US/Pacific"


class LogSession(CommonInfo):
    name = models.CharField(max_length=255, unique=True)
    date_time = models.DateTimeField(blank=True, null=True)
    harv = models.ForeignKey(Harvester, on_delete=models.SET_NULL, blank=True, null=True)
    _zip_file = models.OneToOneField(SessClip, blank=True, null=True, on_delete=models.CASCADE)
    event = models.ForeignKey(Event, on_delete=models.SET_NULL, blank=True, null=True)
    tags = TaggableManager(through='LogTag')

    def __str__(self):
        return self.name

    @property
    def zip_file(self):
        # Access the file field of the related S3File
        return self._zip_file.file.file


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
    _video_avi = models.OneToOneField(S3File, blank=True, null=True, on_delete=models.CASCADE)

    @property
    def video_avi(self):
        return self._video_avi.file

    def __str__(self):
        return self.file_name


class LogTag(TaggedItemBase):
    content_object = models.ForeignKey(LogSession, on_delete=models.CASCADE)