from ..models import JobResults
from ..serializers.jobresultsserializer import JobResultsSerializer
from ..tasks import job_status_update

from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.permissions import IsAuthenticated
from common.viewsets import CreateModelViewSet


class JobResultsView(CreateModelViewSet):
    queryset = JobResults.objects.all()
    serializer_class = JobResultsSerializer
    permission_classes = (IsAuthenticated,)
    filter_backends = (DjangoFilterBackend,)
    filterset_fields = ('job__target__harv_id', 'job__event__UUID')


    def perform_create(self, serializer):
        # Update Job Status in the background
        # if results serialize correctly
        super().perform_create(serializer)

        UUID = serializer.data["event"]["UUID"]
        results = serializer.data["report"]["data"]
        jobresults_pk = serializer.data["id"]
        user_pk = serializer.data["creator"]
        job_status_update.delay(UUID, results, jobresults_pk, user_pk)