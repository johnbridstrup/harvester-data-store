import structlog

from django.contrib.auth.models import User
from django.core.paginator import Paginator
from common.celery import monitored_shared_task
from common.fileloader import get_client

from .models import GripReport
from .serializers.gripreportserializers import GripReportSerializer


logger = structlog.getLogger(__name__)

@monitored_shared_task
def download_gripreport(event, creator):
    client = get_client()
    creator_id = User.objects.get(id=creator).id
    data = client.download_json_from_event(event)
    data["creator"] = creator_id

    serializer = GripReportSerializer(data=data)
    serializer.is_valid(raise_exception=True)
    rep = serializer.save()
    logger.info(f"Picksession report {rep.id} saved (UUID={rep.event.UUID})")
    client.delete_file(event)
    return rep.id

@monitored_shared_task
def extract_grip_report(report_id, log=True):
    GripReportSerializer.extract_report(report_id)
    if log:
        logger.info(f"Grip report {report_id} extracted")

@monitored_shared_task
def extract_grip_reports(per_page=500, **filters):
    qs = GripReport.objects.filter(**filters) 
    paginator = Paginator(qs, per_page)
    logger.info(f"Extracting {paginator.count} grip reports")
    for page in range(1, paginator.num_pages + 1):
        logger.info(f"Extracting page {page} of {paginator.num_pages}")
        for report in paginator.page(page).object_list:
            extract_grip_report(report.id, log=False)
        logger.info(f"Page {page} extracted")
        
