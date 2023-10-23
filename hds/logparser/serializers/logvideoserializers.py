import re
import structlog
import json
import shutil
import os
from django.conf import settings
from django.core.files.uploadedfile import InMemoryUploadedFile
import moviepy.editor as moviepy
from common.async_metrics import ASYNC_ERROR_COUNTER
from common.utils import media_upload_path
from rest_framework import serializers
from logparser.models import LogVideo, LogSession
from s3file.serializers import DirectUploadSerializer


logger = structlog.get_logger(__name__)


class LogVideoUploadSerializer(serializers.ModelSerializer):
    """Serializer for video upload"""

    class Meta:
      model = LogVideo
      fields = ['video_avi']
      read_only_fields = ['id']


class LogVideoSerializer(serializers.ModelSerializer):
    """Serializer for log video model"""
    video_avi = serializers.FileField()

    class Meta:
        model = LogVideo
        fields = ('__all__')
        ready_only_fields = ['id']

    @staticmethod
    def extract_filepath(file_name, path_id):
        full_dirpath = os.path.join(
            settings.EXTRACT_DIR,
            f"{path_id}",
            os.path.splitext(os.path.basename(file_name))[0]
        )
        os.makedirs(full_dirpath, exist_ok=True)
        return full_dirpath

    @staticmethod
    def clean_extracts(path_id):
        path = os.path.join(settings.EXTRACT_DIR, f"{path_id}")
        if os.path.isdir(path):
            shutil.rmtree(path)

    @staticmethod
    def extract_robot_category(filename):
        """extract robot and category e.g color, left-cellcam"""
        robot = None
        category = None

        robot_pattern = re.compile(r'_\d{2}_')
        cat_pattern = re.compile(r'[a-z]+(\-[a-z]+)?')
        robot_match = robot_pattern.search(filename)
        cat_match = cat_pattern.search(filename)

        if robot_match:
            robot = int(robot_match.group(0).replace("_", ""))
        else:
            ASYNC_ERROR_COUNTER.labels(
                'extract_robot_category',
                AttributeError.__name__,
                "Failed robot pattern match"
            ).inc()
            logger.error(f"could not match robot on file", filename=filename)

        if cat_match:
            category = cat_match.group(0)
        else:
            ASYNC_ERROR_COUNTER.labels(
                'extract_robot_category',
                AttributeError.__name__,
                "Failed category pattern match"
            ).inc()
            logger.error(f"could not match category on file", filename=filename)

        return robot, category

    @classmethod
    def extract_video_log(cls, filename, filepath, zip_obj_id):
        robot, category = cls.extract_robot_category(filename)
        log_session = LogSession.objects.get(pk=zip_obj_id)
        mp4_file_path = f'{filepath.split(".")[0]}.mp4'
        mp4_file_name = f'{filename.split(".")[0]}.mp4'
        try:
            stream = moviepy.VideoFileClip(filepath)
            stream.write_videofile(mp4_file_path)
            file_size = os.path.getsize(mp4_file_path)
            with open(mp4_file_path, "rb") as fh:
                in_mem_upload = InMemoryUploadedFile(fh, field_name="video_avi", name=mp4_file_name, size=file_size, content_type="video/x-msvideo", charset=None)
                data = {
                    "key": media_upload_path(log_session, mp4_file_name),
                    "filetype": "mp4",
                    "file": in_mem_upload,
                    "creator": log_session.creator.id,
                }
                serializer = DirectUploadSerializer(data=data)
                serializer.is_valid(raise_exception=True)
                s3file = serializer.save()
                log_vid_obj = LogVideo(
                    file_name=filename,
                    log_session=log_session,
                    creator=log_session.creator,
                    robot=robot,
                    category=category,
                    _video_avi=s3file,
                )
                log_vid_obj.save()
                in_mem_upload.close()

        except Exception as e:
            exc = type(e).__name__
            ASYNC_ERROR_COUNTER.labels(
                'extract_video_log',
                e.__class__.__name__,
                "Could not save log video"
            ).inc()
            logger.error(
                f"could not save the log video",
                filename=filename,
                exception_name=exc,
                exception_info=str(e),
            )

    @staticmethod
    def extract_meta_json_data(filepath, filename):
        """extract meta json data from .json files."""
        ext = ".avi"
        first = filename.split(".")[0]
        filename = f'{first}{ext}'
        try:
            log_vid_obj = LogVideo.objects.get(file_name=filename)
            meta_content = []
            with open(filepath, "r") as file_iter:
                for line in file_iter:
                    line = line.rstrip().strip("\n")
                    data = json.loads(line)
                    meta_content.append(data)
            log_vid_obj.meta = meta_content
            log_vid_obj.save()
        except LogVideo.DoesNotExist:
            ASYNC_ERROR_COUNTER.labels(
                'extract_meta_json_data',
                LogVideo.DoesNotExist.__name__,
                "Log video does not exist"
            ).inc()
            logger.error(
                f"could not find log video with given name",
                filename=filename,
            )