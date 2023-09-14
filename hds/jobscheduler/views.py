from rest_framework.decorators import action
from rest_framework.renderers import JSONRenderer

from common.utils import make_error, make_ok, build_api_url
from common.viewsets import CreateModelViewSet
from harvjobs.models import JobSchema, JobType
from hds.roles import RoleChoices
from .forms import create_job_scheduler_form
from .models import ScheduledJob
from .serializers import ScheduledJobSerializer, ScheduledJobDetailSerializer
from .utils import create_periodic_task
from .filters import ScheduledJobFilterSet


class ScheduledJobView(CreateModelViewSet):
    queryset = ScheduledJob.objects.all()
    serializer_class = ScheduledJobSerializer
    filterset_class = ScheduledJobFilterSet
    ordering = ("-created",)
    view_permissions_update = {
        'create_scheduled_job': {
            RoleChoices.SUPPORT: True, #is_whitelisted
        },
        'create': {
            RoleChoices.SUPPORT: True,
        },
        'disable_job': {
            RoleChoices.SUPPORT: True,
        },
        'enable_job': {
            RoleChoices.SUPPORT: True,
        },
        "user_jobs": {
            RoleChoices.SUPPORT: True,
        }
    }
    action_serializers = {
        "retrieve": ScheduledJobDetailSerializer
    }

    def perform_create(self, serializer):
        inst = super().perform_create(serializer)
        try:
            create_periodic_task(inst.id)
        except:
            inst.delete()
            raise
        return inst

    @action(
        methods=['get'],
        detail=True,
        url_path="cancel",
        renderer_classes=[JSONRenderer],
    )
    def disable_job(self, request):
        obj = self.get_object()
        task = obj.task
        if not task.enabled:
            return make_ok("Task already disabled")

        task.enabled = False
        task.save()
        obj.schedule_status = ScheduledJob.SchedJobStatusChoices.CANCELLED
        obj.save()
        return make_ok("Task disabled")

    @action(
        methods=['get'],
        detail=True,
        url_path="enable",
        renderer_classes=[JSONRenderer],
    )
    def enable_job(self, request):
        obj = self.get_object()
        task = obj.task
        if task.enabled:
            return make_ok("Task already enabled")

        task.enabled = True
        task.save()
        obj.schedule_status = ScheduledJob.SchedJobStatusChoices.WAITING
        obj.save()
        return make_ok("Task enabled")

    @action(
        methods=['get'],
        detail=False,
        url_path="create",
        renderer_classes=[JSONRenderer],
    )
    def create_scheduled_job(self, request):
        JOBTYPE_QP = "jobtype"
        SCH_VERS_QP = "schema_version"
        qps = request.query_params

        if JOBTYPE_QP in qps and SCH_VERS_QP in qps:
            jobtype = qps.get(JOBTYPE_QP)
            schema_version = qps.get(SCH_VERS_QP)
            return make_ok(
                f"Schedule {jobtype} job, schema version {schema_version}.",
                {
                    "form": create_job_scheduler_form(jobtype, schema_version),
                    "submit": build_api_url(
                        request,
                        "scheduledjobs",
                        api_version="current",
                        params={"jobtype": jobtype, "schema_version": schema_version}
                    ),
                },
            )
        if JOBTYPE_QP in qps:
            return make_error("Missing schema_version parameter.")
        if SCH_VERS_QP in qps:
            return make_error("Missing jobtype parameter.")

        jobtypes = JobType.objects.values_list('name', flat=True)
        rel_path = "scheduledjobs/create/"
        resp_data = {"jobs": {}}
        for jobtype in jobtypes:
            versions = JobSchema.objects.filter(jobtype__name=jobtype).order_by("-created").values_list("version", flat=True)
            resp_data["jobs"][jobtype] = {}
            for version in versions:
                params = {
                    "jobtype": jobtype,
                    "schema_version": version,
                }
                get_url = build_api_url(request, rel_path, params=params, api_version="current")
                resp_data["jobs"][jobtype][version] = {
                    "url": get_url,
                    "method": "GET",
                }

        return make_ok("Harvester Job Scheduler Interface", response_data=resp_data)
    
    @action(
        methods=['get'],
        detail=False,
        url_path="myjobs",
        url_name="myjobs",
        renderer_classes=[JSONRenderer],
    )
    def user_jobs(self, request):
        user = request.user
        qs = ScheduledJob.objects.filter(creator=user).order_by("-created")
        page = self.paginate_queryset(qs)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            paginated = self.get_paginated_response(serializer.data)
            return make_ok(f"{user.username} scheduled jobs", response_data=paginated.data)
        
        serializer = self.get_serializer(qs, many=True)
        return make_ok(f"{user.username} scheduled jobs", response_data=serializer.data)
