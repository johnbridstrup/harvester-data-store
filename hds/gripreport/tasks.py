import structlog

from django.contrib.auth.models import User
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
def extract_grip_report(report_id):
    report = GripReport.objects.get(id=report_id)
    GripReportSerializer.extract(report)
    logger.info(f"Grip report {report_id} extracted")
