from celery import Task

from common.celery import monitored_shared_task
from common.utils import build_frontend_url
from errorreport.models import ErrorReport
from notifications.signals import error_report_created
from .serializers import errorreportserializer as es


class SendSignalCallback(Task):
    def after_return(self, status, retval, task_id, args, kwargs, einfo):
        report_id = args[0]
        url = build_frontend_url(endpoint="errorreports", _id=report_id)
        error_report_created.send(sender=ErrorReport, instance_id=report_id, url=url)

@monitored_shared_task(base=SendSignalCallback)
def extract_exceptions_and_notify(report_id):
    es.ErrorReportSerializer.extract_report(report_id)
