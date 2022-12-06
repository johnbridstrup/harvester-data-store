import zipfile
from celery import shared_task
from django.core.cache import cache
from .serializers.logfileserializers import LogFileSerializer
from .serializers.logvideoserializers import LogVideoSerializer
from .serializers.logsessionserializers import (
    LogSessionSerializer,
    LogSession
)


@shared_task
def async_upload_zip_file(_id):
    log_session = LogSession.objects.get(id=_id)
    zip_file = cache.get(log_session.name)
    LogSessionSerializer.async_zip_upload(_id, zip_file)


@shared_task
def perform_extraction(_id):
    log_session = LogSession.objects.get(id=_id)
    zip_file = cache.get(log_session.name)
    async_upload_zip_file.delay(_id)
    with zipfile.ZipFile(zip_file) as thezip:
        for file in thezip.filelist:
            if file.filename.endswith(".log") or file.filename.endswith(".dump"):
                LogFileSerializer.extract_log_file(thezip, _id, file)
            if file.filename.endswith(".avi"):
                LogVideoSerializer.extract_video_log(thezip, _id, file)

    with zipfile.ZipFile(zip_file) as thezip:
        for file in thezip.filelist:
            if file.filename.endswith(".json"):
                LogVideoSerializer.extract_meta_json_data(thezip, file)
        LogVideoSerializer.clean_dir(thezip.filename)
