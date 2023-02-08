from common.celery import monitored_shared_task
from .serializers import AutodiagnosticsReportSerializer


@monitored_shared_task
def extract_autodiag_run(report_id):
    AutodiagnosticsReportSerializer.extract_report(report_id)
