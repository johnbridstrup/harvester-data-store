import re
import zipfile
import structlog
import os
import shutil
from django.conf import settings
from django.core.files.uploadedfile import InMemoryUploadedFile
from django.core.files.storage import FileSystemStorage
from rest_framework import serializers
from taggit.serializers import TagListSerializerField, TaggitSerializer
from common.async_metrics import ASYNC_ERROR_COUNTER
from common.reports import DTimeFormatter
from harvester.models import Harvester
from logparser.models import LogSession, LogFile, TIMEZONE, LogVideo
from s3file.models import SessClip, S3File
from s3file.serializers import DirectUploadSerializer
from event.models import Event
from event.serializers import EventSerializerMixin


logger = structlog.get_logger(__name__)


class VideoSerializer(serializers.ModelSerializer):
    class Meta:
        model = LogVideo
        fields = ["id", "category", "robot"]


class ServiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = LogFile
        fields = ["id", "service", "robot"]


class LogSessionBaseSerializer(serializers.ModelSerializer):
    """Base serializer for log session model"""

    class Meta:
        model = LogSession
        fields = "__all__"
        read_only_fields = ["id"]


class LogSessionUploadSerializer(serializers.ModelSerializer):
    """Logsession upload zip serializer."""

    class Meta:
        model = LogSession
        fields = ["zip_file"]
        read_only_fields = ["id"]


class LogSessionDetailSerializer(serializers.ModelSerializer):
    """Detail serializer for log session model"""

    class Meta:
        model = LogSession
        fields = "__all__"
        read_only_fields = ["id"]

    def to_representation(self, instance):
        data = super().to_representation(instance)
        log_queryset = instance.logfile.all()
        vid_queryset = instance.logvideo.all()
        r_queryset = log_queryset.values_list("robot", flat=True).distinct()
        robots = list(r_queryset)
        services = ServiceSerializer(log_queryset, many=True).data
        videos = VideoSerializer(vid_queryset, many=True).data
        harv_id = instance.harv.harv_id if instance.harv else None
        data["logs"] = {
            "harv_id": harv_id,
            "robots": robots,
            "services": services,
            "videos": videos,
        }
        return data


class LogSessionSerializer(TaggitSerializer, serializers.ModelSerializer):
    """Serializer for the log session model."""

    def __init__(self, instance=None, data=..., s3file_obj=None, **kwargs):
        super().__init__(instance, data, **kwargs)
        self.s3file_obj = s3file_obj

    tags = TagListSerializerField(required=False)

    class Meta:
        model = LogSession
        fields = "__all__"
        read_only_fields = ["id"]

    def to_internal_value(self, data):
        zip_data = data.copy()
        zip_file = zip_data.get("zip_upload")
        internal_data = {}

        if self.s3file_obj:
            zip_file = self.s3file_obj.download_path
            internal_data["event"] = self.s3file_obj.event.id
            internal_data["_zip_file"] = self.s3file_obj.sessclip.id
            internal_data["creator"] = self.s3file_obj.creator.id

        with zipfile.ZipFile(zip_file) as thezip:
            internal_data["name"] = os.path.basename(thezip.filename)
            try:
                file = thezip.filelist[0]
                harv, date_obj = self.extract_harvester_and_date(file)
                internal_data["date_time"] = str(date_obj)
                internal_data["harv"] = harv.pk if harv else None
            except IndexError:
                logger.error("Zip file is empty no files found")

        if not self.s3file_obj:
            # Get user id from request if method is POST
            # create the event & s3file obj for the logsession
            # write sessclip file to fs
            creator = self.context.get("request").user
            UUID = Event.generate_uuid()
            event = EventSerializerMixin.get_or_create_event(
                UUID, creator, S3File.__name__
            )
            s3file = S3File.objects.create(
                filetype="sessclip", creator=creator, event=event
            )
            sess = SessClip.objects.create(file=s3file)
            internal_data["creator"] = creator.id
            internal_data["event"] = event.id
            internal_data["_zip_file"] = sess.id
            os.makedirs(s3file.download_dir, exist_ok=True)
            fs = FileSystemStorage(
                location=s3file.download_dir,
                file_permissions_mode=0o777,
                directory_permissions_mode=0o777,
            )
            fs.save(zip_file.name, zip_file)

        return super().to_internal_value(internal_data)

    @staticmethod
    def extract_harvester_and_date(file):
        """extract harvester and datestring from filename."""
        date_pattern = re.compile(r"\d{14}")
        harv_pattern = re.compile(r"_\d{3}")

        date_match = date_pattern.search(file.filename)
        harv_match = harv_pattern.search(file.filename)

        date_obj = None
        harv = None

        if date_match:
            date_obj = DTimeFormatter.convert_to_datetime(
                date_match.group(0), TIMEZONE, format="%Y%m%d%H%M%S"
            )
        else:
            ASYNC_ERROR_COUNTER.labels(
                "extract_harvester_and_date",
                AttributeError.__name__,
                "Failed date pattern match",
            ).inc()
            logger.error(
                f"could not match date pattern on file",
                filename=file.filename,
            )

        if harv_match:
            harv_id = int(harv_match.group(0).replace("_", ""))
            try:
                harv = Harvester.objects.filter(harv_id=harv_id).first()
            except Harvester.DoesNotExist:
                harv = None
                ASYNC_ERROR_COUNTER.labels(
                    "extract_harvester_and_date",
                    Harvester.DoesNotExist.__name__,
                    "Harvester does not exist",
                ).inc()
                logger.error(
                    f"could not find harvester with harv_id {harv_id}", harv_id=harv_id
                )
        else:
            ASYNC_ERROR_COUNTER.labels(
                "extract_harvester_and_date",
                AttributeError.__name__,
                "Failed harvester pattern match",
            ).inc()
            logger.error(
                f"could not match harv_id pattern on file",
                filename=file.filename,
            )
        return harv, date_obj

    @staticmethod
    def async_zip_upload(_id):
        """upload zip file to s3 bucket."""
        try:
            log_session = LogSession.objects.get(id=_id)
            s3file_obj = log_session._zip_file.file
            zip_path = os.path.join(
                log_session._zip_file.file.download_dir, log_session.name
            )
            file_size = os.path.getsize(zip_path)
            with open(zip_path, "rb") as thezip:
                in_mem_upload = InMemoryUploadedFile(
                    thezip,
                    field_name="file",
                    name=log_session.name,
                    size=file_size,
                    content_type="application/zip",
                    charset=None,
                )
                data = {
                    "key": log_session.name,
                    "file": in_mem_upload,
                    "filetype": "sessclip",
                    "creator": log_session.creator.id,
                }
                serializer = DirectUploadSerializer(instance=s3file_obj, data=data)
                serializer.is_valid(raise_exception=True)
                serializer.save()
                in_mem_upload.close()

        except LogSession.DoesNotExist:
            ASYNC_ERROR_COUNTER.labels(
                "async_zip_upload",
                LogSession.DoesNotExist.__name__,
                "Logsession does not exist",
            ).inc()
            logger.error(f"log session with id {_id} does not exist", logsession_id=_id)

    @staticmethod
    def create_logsession(s3file_obj):
        data = {"zip_upload": {}}
        serializer = LogSessionSerializer(data=data, s3file_obj=s3file_obj)
        serializer.is_valid(raise_exception=True)
        instance = serializer.save()
        return instance.id

    @staticmethod
    def clean_downloads(path_id):
        path = os.path.join(settings.DOWNLOAD_DIR, f"{path_id}")
        if os.path.isdir(path):
            shutil.rmtree(path)
