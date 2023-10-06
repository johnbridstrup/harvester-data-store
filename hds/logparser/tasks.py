import zipfile
from celery import chord, Task
from collections import defaultdict
from common.celery import monitored_shared_task
from django.core.cache import cache
from common.utils import build_frontend_url
from notifications.slack import post_to_slack
from .serializers.logfileserializers import LogFileSerializer
from .serializers.logvideoserializers import LogVideoSerializer, extract_filepath, EXTRACT_DIR
from .serializers.logsessionserializers import (
    LogSessionSerializer,
    LogSession
)


class CallbackTask(Task):
    def _get_slack_id(self, _id):
        creator = LogSession.objects.get(id=_id).creator
        self.slack_id = creator.profile.slack_id

    @staticmethod
    def _create_post_message(content, slack_id=None):
        content += f"\n<@{slack_id}>"
        content_list = [{
            "type": "section",
            "text": {
                "type": "mrkdwn",
                "text": content,
            }
        }]
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

@monitored_shared_task
def async_upload_zip_file(_id):
    log_session = LogSession.objects.get(id=_id)
    zip_file = cache.get(log_session.name)
    LogSessionSerializer.async_zip_upload(_id, zip_file, log_session.name, log_session.creator.id)

@monitored_shared_task
def extract_video_meta(vid_dict, _id):
    avi_info = vid_dict['avi']
    meta_info = vid_dict['meta']
    LogVideoSerializer.extract_video_log(avi_info['filename'], avi_info['filepath'], _id)
    LogVideoSerializer.extract_meta_json_data(meta_info['filepath'], meta_info['filename'])

@monitored_shared_task
def clean_dir(dir_name):
    LogVideoSerializer.clean_dir(dir_name)
    return f"{dir_name} Cleaned"

@monitored_shared_task(base=CallbackTask)
def perform_extraction(_id):
    log_session = LogSession.objects.get(id=_id)
    zip_file = cache.get(log_session.name)
    async_upload_zip_file.delay(_id)

    vid_meta_pairs = defaultdict(dict)
    with zipfile.ZipFile(zip_file) as thezip:
        zipfile_name = thezip.filename
        extr_dir = extract_filepath(zipfile_name)
        for file in thezip.filelist:
            if file.filename.endswith(".log") or file.filename.endswith(".dump"):
                LogFileSerializer.extract_log_file(thezip, _id, file)
            if file.filename.endswith(".avi"):
                extr_filepath = thezip.extract(file, extr_dir)
                basename = file.filename.split('.')[0]
                vid_meta_pairs[basename]['avi'] = {
                    "filepath": extr_filepath,
                    "filename": file.filename,
                }
            if file.filename.endswith(".json"):
                extr_filepath = thezip.extract(file, extr_dir)
                basename = file.filename.split('.')[0]
                vid_meta_pairs[basename]['meta'] = {
                    "filepath": extr_filepath,
                    "filename": file.filename,
                }

    # Create video extraction task signatures
    tasks = [extract_video_meta.si(vid_dict, _id) for vid_dict in vid_meta_pairs.values()]
    # Create clean_dir callback signature
    callback = clean_dir.si(zipfile_name)
    # Execute tasks -> callback as Celery chord
    chord(tasks, callback).delay()

    return "Extracting Videos"
