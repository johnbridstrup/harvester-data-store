import os
import shutil
from django.urls import reverse
from urllib.parse import urljoin
from django.db import models
from django.conf import settings
from django.core.files.storage import default_storage

from common.models import CommonInfo
from common.utils import media_upload_path
from common.fileloader import get_client
from event.models import EventModelMixin


class S3File(EventModelMixin, CommonInfo):
    file = models.FileField(
        upload_to=media_upload_path, blank=True, null=True, max_length=500
    )
    filetype = models.CharField(max_length=255)
    key = models.CharField(max_length=255, null=True, blank=True)
    deleted = models.BooleanField(default=False)

    def __str__(self) -> str:
        return str(self.file)

    def url(self, request, pk):
        if request is None:
            return None
        url = request.build_absolute_uri(reverse("s3file-detail", args=[pk]))
        redirect_url = urljoin(url, "download/")
        return redirect_url

    def file_url(self, request):
        if self.file:
            if any([x in self.file.url for x in ["http://", "https://"]]):
                return self.file.url
            if request is not None:
                url = urljoin("http://" + request.get_host(), self.file.url)
                return url
        return None

    def delete_from_s3(self):
        self.file.delete()  # deletes file from storages
        self.save()

    @property
    def download_dir(self):
        return os.path.join(settings.DOWNLOAD_DIR, f"{self.pk}")

    @property
    def download_path(self):
        return os.path.join(self.download_dir, os.path.basename(self.file.name))

    def check_for_s3file(self):
        if settings.USES3:
            client = get_client()
            # check for file using key attr
            exists = client.check_s3_file(self.key)
            if not exists:
                # check for file using filefield name
                exists = client.check_s3_file(self.file.name)
                if not exists:
                    raise Exception("S3File does not exist in the bucket")

    def download(self):
        os.makedirs(self.download_dir, exist_ok=True)
        with default_storage.open(self.file.name, "rb") as file:
            with open(self.download_path, "wb") as dest:
                dest.write(file.read())

    def clean_download(self):
        if os.path.isdir(self.download_dir):
            shutil.rmtree(self.download_dir)


class S3FileMixin(models.Model):
    file = models.OneToOneField(S3File, on_delete=models.CASCADE)

    class Meta:
        abstract = True

    @property
    def file_url(self):
        return self.file.file.url if self.file.file else None

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

    @property
    def deleted(self):
        return self.file.deleted


class SessClip(S3FileMixin, models.Model):
    def __str__(self):
        return f"sessclip: {str(self.file.file)}"
