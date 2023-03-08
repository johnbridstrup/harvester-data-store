from sys import api_version
from django.urls import reverse
from rest_framework.decorators import action
from rest_framework.renderers import JSONRenderer

from common.utils import make_error, make_ok, build_api_url
from common.viewsets import CreateModelViewSet
from harvjobs.models import JobSchema, JobType
from hds.roles import RoleChoices
from .forms import create_job_scheduler_form
from .models import ScheduledJob
from .serializers import ScheduledJobSerializer


class ScheduledJobView(CreateModelViewSet):
    queryset = ScheduledJob.objects.all()
    serializer_class = ScheduledJobSerializer
    view_permissions_update = {
        'create_scheduled_job': {
            RoleChoices.DEVELOPER: True, #is_whitelisted
        },
        'create': {
            RoleChoices.DEVELOPER: True,
        }
    }

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
    