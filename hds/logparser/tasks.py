import zipfile
import structlog
from celery import Task
from collections import defaultdict
from common.celery import monitored_shared_task
from common.utils import build_frontend_url
from s3file.models import S3File
from notifications.slack import post_to_slack
from .serializers.logfileserializers import LogFileSerializer
from .serializers.logvideoserializers import LogVideoSerializer
from .serializers.logsessionserializers import (
    LogSessionSerializer,
    LogSession,
)


logger = structlog.get_logger(__name__)


class CallbackTask(Task):
    def _get_slack_id(self, _id):
        creator = LogSession.objects.get(id=_id).creator
        self.slack_id = creator.profile.slack_id

    @staticmethod
    def _create_post_message(content, slack_id=None):
        content += f"\n<@{slack_id}>"
        content_list = [
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": content,
                },
            }
        ]
        message = {
            "channel": "hds-notifications",
            "text": "*SESSCLIP RESULTS*",
            "blocks": content_list,
        }
        post_to_slack(message)

    def on_failure(self, exc, task_id, args, kwargs, einfo):
        self._get_slack_id(args[0])
        content = (
            f"Failed to process sessclip.\n"
            f"Exc: {exc.__class__.__name__}\n"
            f"Content: {einfo}\n"
            f"{build_frontend_url('logfiles', args[0])}"
        )
        self._create_post_message(content, self.slack_id)

    def on_success(self, retval, task_id, args, kwargs):
        self._get_slack_id(args[0])
        content = (
            f"Finished processing sessclip.\n"
            f"{build_frontend_url('logfiles', args[0])}"
        )
        self._create_post_message(content, self.slack_id)

    def after_return(self, status, retval, task_id, args, kwargs, einfo):
        s3file = LogSession.objects.get(id=args[0])._zip_file.file
        s3file.clean_download()
        return super().after_return(
            status, retval, task_id, args, kwargs, einfo
        )


class CBCleanTask(Task):
    # Note: the order of the args while using this class -> (s3file_id, *args, **kwargs)
    def after_return(self, status, retval, task_id, args, kwargs, einfo):
        s3file = S3File.objects.get(id=args[0])
        s3file.clean_download()
        return super().after_return(
            status, retval, task_id, args, kwargs, einfo
        )


def extract_video_meta(vid_dict, _id):
    avi_info = vid_dict["avi"]
    meta_info = vid_dict["meta"]
    LogVideoSerializer.extract_video_log(
        avi_info["filename"], avi_info["filepath"], _id
    )
    LogVideoSerializer.extract_meta_json_data(
        meta_info["filepath"], meta_info["filename"]
    )


def clean_dir(path_id):
    LogVideoSerializer.clean_extracts(path_id)
    LogSessionSerializer.clean_downloads(path_id)
    return f"path {path_id} cleaned"


def extract_logs(_id, zippath):
    with zipfile.ZipFile(zippath) as thezip:
        for file in thezip.filelist:
            if file.filename.endswith(".log") or file.filename.endswith(
                ".dump"
            ):
                LogFileSerializer.extract_log_file(thezip, _id, file)


def extract_with_video(zippath, path_id):
    vid_meta_pairs = defaultdict(dict)
    with zipfile.ZipFile(zippath) as thezip:
        zipfile_name = thezip.filename
        extr_dir = LogVideoSerializer.extract_filepath(zipfile_name, path_id)
        for file in thezip.filelist:
            if file.filename.endswith(".avi"):
                extr_filepath = thezip.extract(file, extr_dir)
                basename = file.filename.split(".")[0]
                vid_meta_pairs[basename]["avi"] = {
                    "filepath": extr_filepath,
                    "filename": file.filename,
                }
            if file.filename.endswith(".json"):
                extr_filepath = thezip.extract(file, extr_dir)
                basename = file.filename.split(".")[0]
                vid_meta_pairs[basename]["meta"] = {
                    "filepath": extr_filepath,
                    "filename": file.filename,
                }
    return vid_meta_pairs


def update_harv_datetime(log_session, zippath):
    with zipfile.ZipFile(zippath) as thezip:
        try:
            file = thezip.filelist[0]
            harv, date_obj = LogSessionSerializer.extract_harvester_and_date(
                file
            )
            log_session.date_time = date_obj
            log_session.harv = harv
            log_session.save()
        except IndexError:
            logger.info("Zip file is empty no files found")


@monitored_shared_task(base=CallbackTask)
def perform_extraction(_id, extract_video=True):
    log_session = LogSession.objects.get(id=_id)
    log_session._zip_file.file.download()
    zippath = log_session._zip_file.file.download_path

    update_harv_datetime(log_session, zippath)

    extract_logs(_id, zippath)

    if extract_video:
        vid_meta_pairs = extract_with_video(
            zippath, log_session._zip_file.file.pk
        )
        for vid_dict in vid_meta_pairs.values():
            extract_video_meta(vid_dict, _id)

    clean_dir(log_session._zip_file.file.pk)


@monitored_shared_task(base=CBCleanTask)
def download_create_logsession(s3file_id):
    s3file = S3File.objects.get(id=s3file_id)
    _id = LogSessionSerializer.create_logsession(s3file)
    perform_extraction(_id, extract_video=False)
