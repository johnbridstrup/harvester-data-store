import zipfile
from celery import shared_task, Task
from django.core.cache import cache
from common.utils import build_frontend_url
from notifications.slack import post_to_slack
from .serializers.logfileserializers import LogFileSerializer
from .serializers.logvideoserializers import LogVideoSerializer
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

@shared_task
def async_upload_zip_file(_id):
    log_session = LogSession.objects.get(id=_id)
    zip_file = cache.get(log_session.name)
    LogSessionSerializer.async_zip_upload(_id, zip_file)


@shared_task(base=CallbackTask)
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
