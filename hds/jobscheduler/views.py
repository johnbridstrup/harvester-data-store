from django.utils.decorators import method_decorator
from django.views.decorators.cache import cache_page
from rest_framework import status
from rest_framework.decorators import action
from rest_framework.renderers import JSONRenderer
from rest_framework.response import Response
from django_celery_beat.models import PeriodicTask

from common.utils import make_error, make_ok, build_api_url
from common.viewsets import CreateModelViewSet, AdminActionMixin
from harvjobs.models import JobSchema, JobType
from hds.roles import RoleChoices
from .forms import create_job_scheduler_form
from .models import ScheduledJob
from .serializers import (
    ScheduledJobSerializer,
    ScheduledJobDetailSerializer,
    PeriodicTaskSerializer
)
from .utils import create_periodic_task
from .filters import ScheduledJobFilterSet
from .tasks import run_tasks


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
        "retrieve": ScheduledJobDetailSerializer,
        "list": ScheduledJobDetailSerializer,
        "user_jobs": ScheduledJobDetailSerializer,
    }

    def get_queryset(self):
        return ScheduledJob.objects.select_related(
            "creator",
            "modifiedBy",
            "task",
        ).prefetch_related("targets", "jobs",)

    def perform_create(self, serializer):
        inst = super().perform_create(serializer)
        try:
            create_periodic_task(inst.id)
        except:
            inst.delete()
            raise
        return inst

    def create(self, request, *args, **kwargs):
        resp = super().create(request, *args, **kwargs)
        resp.status_code = status.HTTP_202_ACCEPTED
        return resp

    @action(
        methods=['get'],
        detail=True,
        url_path="cancel",
        renderer_classes=[JSONRenderer],
    )
    def disable_job(self, request, pk=None):
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
    def enable_job(self, request, pk=None):
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
    @method_decorator(cache_page(60*10))
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


class PeriodicTaskView(CreateModelViewSet, AdminActionMixin):
    queryset = PeriodicTask.objects.all()
    serializer_class = PeriodicTaskSerializer
    http_method_names = ['get', 'head']
    view_permissions_update = {
        "actionables": {
            "admin": True
        },
        "action_item_view": {
            "admin": True
        },
    }

    def action_items(self) -> list:
        return [
            "run_tasks",
            "delete_tasks",
            "enable_tasks",
            "disable_tasks"
        ]

    def run_actions(self, request) -> Response:
        action = request.query_params.get("action", None)
        task_ids = request.query_params.get("ids", None)

        if action is not None and task_ids is not None:
            task_ids = task_ids.split(",")
            if action in self.action_items() and action == "enable_tasks":
                periodic_tasks = PeriodicTask.objects.filter(pk__in=task_ids)
                for task in periodic_tasks:
                    if not task.enabled:
                        task.enabled = True
                        task.save()
                return make_ok(f"{action} executed successfully")
            elif action in self.action_items() and action == "disable_tasks":
                periodic_tasks = PeriodicTask.objects.filter(pk__in=task_ids)
                for task in periodic_tasks:
                    if task.enabled:
                        task.enabled = False
                        task.save()
                return make_ok(f"{action} executed successfully")
            elif action in self.action_items() and action == "run_tasks":
                periodic_tasks = PeriodicTask.objects.filter(pk__in=task_ids)
                msg = run_tasks(periodic_tasks)
                return make_ok(msg)
            elif action in self.action_items() and action == "delete_tasks":
                periodic_tasks = PeriodicTask.objects.filter(pk__in=task_ids).delete()
                return make_ok(f"{action} executed successfully")
        return make_error("Query params (action, ids) should not be None")

    @action(
        methods=['get'],
        detail=False,
        url_path="actionables",
        renderer_classes=[JSONRenderer],
    )
    def actionables(self, request):
        return self.run_actions(request)
