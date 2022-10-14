from celery import shared_task
from common.async_metrics import ASYNC_ERROR_COUNTER
from common.models import Tags
from .models import ErrorReport
from .serializers import errorreportserializer as es

import logging


@shared_task
def extract_exceptions(report_id):
    report_inst = ErrorReport.objects.get(id=report_id)
    try:
        es.ErrorReportSerializer.create_exceptions(report_inst)
    except Exception as e:
        exc = type(e).__name__
        ASYNC_ERROR_COUNTER.labels("exctract_exceptions", exc, es.EXC_EXT_FAIL_MSG).inc()
        report_inst.tags.add(Tags.INCOMPLETE.value) 
        report_inst.save()
        
        logging.exception(f"{exc} caught in create_exceptions")