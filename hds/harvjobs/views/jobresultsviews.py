from common.utils import build_frontend_url
from common.viewsets import ReportModelViewSet
from event.models import Event
from ..filters import JobResultsFilterset
from ..models import JobResults, Job
from ..serializers.jobresultsserializer import (
    JobResultsSerializer,
    JobResultsDetailSerializer,
)
from ..tasks import job_status_update


class JobResultsView(ReportModelViewSet):
    queryset = JobResults.objects.all()
    serializer_class = JobResultsSerializer
    filterset_class = JobResultsFilterset
    action_serializers = {"retrieve": JobResultsDetailSerializer}

    def get_queryset(self):
        if self.action == "retrieve":
            return JobResults.objects.select_related(
                "creator",
                "modifiedBy",
                "harvester",
                "location",
                "event",
                "job",
            ).prefetch_related("tags", "host_results")
        return super().get_queryset()

    def perform_create(self, serializer):
        # Update Job Status in the background
        # if results serialize correctly
        super().perform_create(serializer)

        event_id = serializer.data["event"]
        results = serializer.data["report"]["data"]
        jobresults_pk = serializer.data["id"]
        user_pk = serializer.data["creator"]
        job_id = Job.objects.get(event=event_id).id
        UUID = Event.objects.get(id=event_id).UUID
        url = build_frontend_url(endpoint="jobs", _id=job_id)
        job_status_update.delay(UUID, results, jobresults_pk, user_pk, url)
