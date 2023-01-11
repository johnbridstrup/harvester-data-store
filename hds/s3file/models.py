from django.db import models
from common.models import CommonInfo
from common.utils import media_upload_path
from event.models import EventModelMixin

from urllib.parse import urljoin


class S3File(EventModelMixin, CommonInfo):
    file = models.FileField(upload_to=media_upload_path, blank=True, null=True)
    filetype = models.CharField(max_length=255)
    key = models.CharField(max_length=255, null=True, blank=True)

    def __str__(self) -> str:
        return str(self.file)

    def url(self, request):
        if any([x in self.file.url for x in ["http://", "https://"]]):
            return self.file.url
        if request is not None:
            url = urljoin(urljoin("http://" + request.get_host(), "/api/v1/"), self.file.url)
            return url

class S3FileMixin(models.Model):
    file = models.OneToOneField(S3File, on_delete=models.CASCADE)
    class Meta:
        abstract = True

    @property
    def file_url(self):
        return self.file.file.url
    
    @property
    def creator(self):
        return self.file.creator

    @property
    def created(self):
        return self.file.created

    @property
    def modifiedBy(self):
        return self.file.modifiedBy

    @property
    def lastModified(self):
        return self.file.lastModified


class SessClip(S3FileMixin, models.Model):
    def __str__(self):
        return f"sessclip: {str(self.file.file)}"
