from common.celery import monitored_shared_task
from errorreport.models import ErrorReport


@monitored_shared_task
def clean_beatbox():
    bbox_err_reports = ErrorReport.objects.filter(
        harvester__name__icontains="beatbox"
    )
    for errep in bbox_err_reports:
        errep.event.delete()
        errep.pick_session.delete()
