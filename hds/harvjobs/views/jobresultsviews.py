from ..filters import JobResultsFilterset
from ..models import JobResults, Job
from ..serializers.jobresultsserializer import JobResultsSerializer
from ..tasks import job_status_update
from common.utils import build_frontend_url
from common.viewsets import ReportModelViewSet


class JobResultsView(ReportModelViewSet):
    queryset = JobResults.objects.all()
    serializer_class = JobResultsSerializer
    filterset_class = JobResultsFilterset


    def perform_create(self, serializer):
        # Update Job Status in the background
        # if results serialize correctly
        super().perform_create(serializer)

        UUID = serializer.data["event"]["UUID"]
        results = serializer.data["report"]["data"]
        jobresults_pk = serializer.data["id"]
        user_pk = serializer.data["creator"]
        job_id = Job.objects.get(event__UUID=UUID).id
        url = build_frontend_url(endpoint="jobs", _id=job_id)
        job_status_update.delay(UUID, results, jobresults_pk, user_pk, url)
