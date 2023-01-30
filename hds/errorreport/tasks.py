from common.celery import monitored_shared_task
from .serializers import errorreportserializer as es


@monitored_shared_task
def extract_exceptions(report_id):
    es.ErrorReportSerializer.extract_report(report_id)
