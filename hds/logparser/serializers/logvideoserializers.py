import re
import logging
import json
import shutil
import os
from django.conf import settings
from django.core.files.uploadedfile import InMemoryUploadedFile
import moviepy.editor as moviepy
from common.async_metrics import ASYNC_ERROR_COUNTER
from rest_framework import serializers
from logparser.models import LogVideo, LogSession


EXTRACT_DIR = os.path.join(settings.MEDIA_ROOT, "extracts")

extract_filepath = lambda filename: os.path.join(
    EXTRACT_DIR, os.path.splitext(filename)[0]
)


class LogVideoUploadSerializer(serializers.ModelSerializer):
    """Serializer for video upload"""

    class Meta:
      model = LogVideo
      fields = ['video_avi']
      ready_only_fields = ['id']


class LogVideoSerializer(serializers.ModelSerializer):
    """Serializer for log video model"""

    class Meta:
        model = LogVideo
        fields = ('__all__')
        ready_only_fields = ['id']


    @staticmethod
    def clean_dir(filename:str):
        shutil.rmtree(extract_filepath(filename))

    @staticmethod
    def extract_robot_category(file):
        """extract robot and category e.g color, left-cellcam"""
        robot = None
        category = None

        robot_pattern = re.compile(r'_\d{2}_')
        cat_pattern = re.compile(r'[a-z]+(\-[a-z]+)?')
        robot_match = robot_pattern.search(file.filename)
        cat_match = cat_pattern.search(file.filename)

        if robot_match:
            robot = int(robot_match.group(0).replace("_", ""))
        else:
            ASYNC_ERROR_COUNTER.labels(
                'extract_robot_category',
                AttributeError.__name__,
                "Failed robot pattern match"
            ).inc()
            logging.error(f"could not match robot on file, {file.filename}")

        if cat_match:
            category = cat_match.group(0)
        else:
            ASYNC_ERROR_COUNTER.labels(
                'extract_robot_category',
                AttributeError.__name__,
                "Failed category pattern match"
            ).inc()
            logging.error(f"could not match category on file {file.filename}")

        return robot, category

    @classmethod
    def extract_video_log(cls, thezip, zip_obj_id, file):
        robot, category = cls.extract_robot_category(file)
        log_session = LogSession.objects.get(pk=zip_obj_id)
        video_file = thezip.extract(file, extract_filepath(thezip.filename))
        mp4_file_path = f'{video_file.split(".")[0]}.mp4'
        mp4_file_name = f'{file.filename.split(".")[0]}.mp4'
        try:
            log_vid_obj = LogVideo(
                file_name=file.filename,
                log_session=log_session,
                creator=log_session.creator,
                robot=robot,
                category=category
            )
            log_vid_obj.save()
            stream = moviepy.VideoFileClip(video_file)
            stream.write_videofile(mp4_file_path)
            file_size = os.path.getsize(mp4_file_path)
            with open(mp4_file_path, "rb") as fh:
                in_mem_upload = InMemoryUploadedFile(fh, field_name="video_avi", name=mp4_file_name, size=file_size, content_type="video/x-msvideo", charset=None)
                serializer = LogVideoUploadSerializer(instance=log_vid_obj, data={'video_avi':in_mem_upload})
                serializer.is_valid(raise_exception=True)
                serializer.save()
                in_mem_upload.close()
        except Exception as e:
            ASYNC_ERROR_COUNTER.labels(
                'extract_video_log',
                e.__class__.__name__,
                "Could not save log video"
            ).inc()
            logging.info(f"could not save the log video {file.filename} {e}")

    @staticmethod
    def extract_meta_json_data(thezip, file):
        """extract meta json data from .json files."""
        ext = ".avi"
        first = file.filename.split(".")[0]
        filename = f'{first}{ext}'
        try:
            log_vid_obj = LogVideo.objects.get(file_name=filename)
            meta_content = []
            with thezip.open(file, "r") as file_iter:
                for line in file_iter:
                    line = line.decode("ascii").rstrip().strip("\n")
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
            logging.error(
                f"could not find log video with given name {file.filename}"
            )