from common.celery import monitored_shared_task
from common.models import Tags
from .models import ErrorReport
from .serializers import errorreportserializer as es

import logging


@monitored_shared_task
def extract_exceptions(report_id):
    report_inst = ErrorReport.objects.get(id=report_id)
    try:
        es.ErrorReportSerializer.create_exceptions(report_inst)
    except Exception as e:
        exc = type(e).__name__
        report_inst.tags.add(Tags.INCOMPLETE.value) 
        report_inst.save()
        
        logging.exception(f"{exc} caught in create_exceptions")
