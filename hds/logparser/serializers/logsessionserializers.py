import re
import zipfile
import logging
import uuid
from django.core.cache import cache
from rest_framework import serializers
from taggit.serializers import TagListSerializerField, TaggitSerializer
from common.async_metrics import ASYNC_ERROR_COUNTER, ASYNC_UPLOAD_COUNTER
from common.reports import DTimeFormatter
from harvester.models import Harvester
from logparser.models import LogSession, LogFile, TIMEZONE, LogVideo
from s3file.models import SessClip
from s3file.serializers import DirectUploadSerializer


class VideoSerializer(serializers.ModelSerializer):
    class Meta:
        model = LogVideo
        fields = ['id', 'category', 'robot']


class ServiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = LogFile
        fields = ['id', 'service', 'robot']


class LogSessionBaseSerializer(serializers.ModelSerializer):
    """Base serializer for log session model"""
    class Meta:
        model = LogSession
        fields = ('__all__')
        read_only_fields = ['id']


class LogSessionUploadSerializer(serializers.ModelSerializer):
    """Logsession upload zip serializer."""
    class Meta:
        model = LogSession
        fields = ['zip_file']
        read_only_fields = ['id']


class LogSessionSerializer(TaggitSerializer, serializers.ModelSerializer):
    """Serializer for the log session model."""
    tags = TagListSerializerField(required=False)
    class Meta:
        model = LogSession
        fields = ('__all__')
        read_only_fields = ['id', 'creator']

    def to_internal_value(self, data):
        zip_data = data.copy()
        zip_file = zip_data.get("zip_upload")
        internal_data = {}
        with zipfile.ZipFile(zip_file) as thezip:
            filename = f'{thezip.filename}-{uuid.uuid4()}'
            internal_data["name"] = filename
            cache.set(filename, zip_file)
            try:
                file = thezip.filelist[0]
                harv, date_obj = self.extract_harvester_and_date(file)
                internal_data["date_time"] = str(date_obj)
                internal_data["harv"] = harv.pk if harv else None
            except IndexError:
                logging.error('Zip file is empty no files found')

        return super().to_internal_value(internal_data)

    def to_representation(self, instance):
        data = super().to_representation(instance)
        queryset = LogFile.objects.filter(log_session=instance)
        vid_queryset = LogVideo.objects.filter(log_session=instance)
        r_queryset = queryset.values_list('robot')
        robots = [robot[0] for robot in set(r_queryset) ]
        services = ServiceSerializer(queryset, many=True).data
        videos = VideoSerializer(vid_queryset, many=True).data
        harv_id = instance.harv.harv_id if instance.harv else None
        data["logs"] = {
            'harv_id': harv_id,
            'robots': robots,
            'services': services,
            'videos': videos
        }
        return data

    @staticmethod
    def extract_harvester_and_date(file):
        """extract harvester and datestring from filename."""
        date_pattern = re.compile(r'\d{14}')
        harv_pattern = re.compile(r'_\d{3}')

        date_match = date_pattern.search(file.filename)
        harv_match = harv_pattern.search(file.filename)

        date_obj = None
        harv = None

        if date_match:
            date_obj = DTimeFormatter.convert_to_datetime(
            date_match.group(0), TIMEZONE, format='%Y%m%d%H%M%S'
            )
        else:
            ASYNC_ERROR_COUNTER.labels(
                'extract_harvester_and_date',
                AttributeError.__name__,
                "Failed date pattern match"
            ).inc()
            logging.error(
                f"could not match date pattern on file {file.filename}"
            )

        if harv_match:
            harv_id = int(harv_match.group(0).replace("_", ""))
            try:
                harv = Harvester.objects.filter(harv_id=harv_id).first()
            except Harvester.DoesNotExist:
                harv = None
                ASYNC_ERROR_COUNTER.labels(
                    'extract_harvester_and_date',
                    Harvester.DoesNotExist.__name__,
                    "Harvester does not exist"
                ).inc()
                logging.error(f"could not find harvester with harv_id {harv_id}")
        else:
            ASYNC_ERROR_COUNTER.labels(
                'extract_harvester_and_date',
                AttributeError.__name__,
                "Failed harvester pattern match"
            ).inc()
            logging.error(
                f"could not match harv_id pattern on file {file.filename}"
            )
        return harv, date_obj

    @staticmethod
    def async_zip_upload(_id, thezip, filename, user_id):
        """upload zip file to s3 bucket."""
        try:
            log_session = LogSession.objects.get(id=_id)
            data = {
                    "key": filename,
                    "file": thezip,
                    "filetype": "sessclip",
                    "creator": user_id,
                }
            serializer = DirectUploadSerializer(data=data)
            serializer.is_valid(raise_exception=True)
            s3file = serializer.save()
            sessclip = SessClip.objects.create(file=s3file)
            log_session._zip_file = sessclip
            log_session.save()

        except LogSession.DoesNotExist:
            ASYNC_ERROR_COUNTER.labels(
                'async_zip_upload',
                LogSession.DoesNotExist.__name__,
                "Logsession does not exist"
            ).inc()
            logging.info(f"log session with id {_id} does not exist")
