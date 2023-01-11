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
