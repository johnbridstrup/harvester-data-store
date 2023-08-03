from ..filters import JobFilterset
from ..models import Job
from ..roles import whitelist
from ..serializers.jobserializer import (
    JobSerializer,
    JobHistorySerializer,
    JobDetailSerializer
)
from ..tasks import schedule_job

from rest_framework.decorators import action
from rest_framework.renderers import JSONRenderer
from common.utils import make_ok
from common.viewsets import CreateModelViewSet
from hds.roles import RoleChoices


# Whitelists
is_support_whitelist = whitelist(["sess_clip", "session_scrape", "test"])


class JobView(CreateModelViewSet):
    queryset = Job.objects.all()
    serializer_class = JobSerializer
    filterset_class = JobFilterset
    ordering = ('-created', )
    view_permissions_update = {
        'create': {
            RoleChoices.SUPPORT: is_support_whitelist,
            RoleChoices.MANAGER: True,
        },
        'status_history': {
            RoleChoices.SUPPORT: True,
            RoleChoices.JENKINS: True,
        },
        'reschedule': {
            RoleChoices.SUPPORT: is_support_whitelist,
            RoleChoices.MANAGER: True,
        },
    }
    action_serializers = {
        "list": JobDetailSerializer,
        "retrieve": JobDetailSerializer
    }

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

    @action(
        methods=['GET'],
        url_path='reschedule',
        detail=True,
        renderer_classes=[JSONRenderer]
    )
    def reschedule(self, request, pk=None):
        """reschedule a job."""
        job = self.get_object()

        schedule_job.delay(job.id, job.target.id, request.user.id)

        serializer = JobSerializer(job)

        return make_ok(f'Job {job.id} rescheduled successfully', serializer.data)
