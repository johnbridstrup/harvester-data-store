from ..models import Job
from ..serializers.jobserializer import JobSerializer, JobHistorySerializer
from ..tasks import schedule_job

from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.renderers import JSONRenderer
from common.utils import make_ok
from common.viewsets import CreateModelViewSet


class JobView(CreateModelViewSet):
    queryset = Job.objects.all()
    serializer_class = JobSerializer
    permission_classes = (IsAuthenticated,)
    filterset_fields = ('target__harv_id', 'schema__id', 'schema__version',)
    ordering = ('-created', )

    @action(
        methods=["get"],
        detail=True,
        url_path="history",
        renderer_classes=[JSONRenderer]
    )
    def status_history(self, request, pk=None):
        job = self.get_object()
        queryset = job.history.all()
        page = self.paginate_queryset(queryset=queryset)
        if page is not None:
            serializer = JobHistorySerializer(page, many=True)
            resp = self.get_paginated_response(serializer.data)
            data = resp.data
        else:
            serializer = JobHistorySerializer(queryset, many=True)
            data = serializer.data
        return make_ok(f"Job {job.event.UUID} history", data)

    def perform_create(self, serializer):
        super().perform_create(serializer)

        job_id = serializer.data["id"]
        harv_pk = serializer.data["target"]

        schedule_job.delay(job_id, harv_pk, self.request.user.id)

