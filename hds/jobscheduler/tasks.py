import jsonschema
import structlog
from celery import Task

from common.celery import monitored_shared_task
from event.models import Event
from harvjobs.models import Job, JobSchema
from harvjobs.tasks import schedule_job
from .models import ScheduledJob


logger = structlog.getLogger(__name__)


class RunSchedCallback(Task):
    def on_failure(self, exc, task_id, args, kwargs, einfo):
        job = ScheduledJob.objects.get(id=args[0])
        job.schedule_status = ScheduledJob.SchedJobStatusChoices.SCHEDFAIL
        job.save()


@monitored_shared_task(base=RunSchedCallback, bind=True)
def run_scheduled_job(self, sched_job_id):
    sched_job = ScheduledJob.objects.get(id=sched_job_id)
    schema = JobSchema.objects.get(
        jobtype__name=sched_job.job_def["jobtype"],
        version=sched_job.job_def["schema_version"],
    )

    job_def = sched_job.job_def["payload"]
    if schema.is_dynamic:
        job_def = schema.payload_from_dynamic(job_def)

    try:
        jsonschema.validate(sched_job.job_def["payload"], schema.schema)
    except jsonschema.ValidationError as e:
        sched_job.schedule_status = ScheduledJob.SchedJobStatusChoices.SCHEDFAIL
        sched_job.task.enabled = False
        sched_job.save()
        logger.exception(e)
        return "Failed to validate payload"

    harvs = sched_job.targets.all()
    job_obj = {
        "schema": schema,
        "payload": sched_job.job_def["payload"],
        "creator": sched_job.creator,
    }
    for harv in harvs:
        job_obj["target"] = harv
        ev_obj = {
            "UUID": Event.generate_uuid(),
            "creator": sched_job.creator,
            "tags": [],
        }
        event = Event(**ev_obj)
        event.save()
        job_obj["event"] = event
        job_obj["payload"]["id"] = event.UUID
        job_obj["payload"]["job_type"] = schema.jobtype.name
        job = Job(**job_obj)
        job.save()
        schedule_job.delay(job.id, harv.id, sched_job.creator.id)

        sched_job.jobs.add(job)
        sched_job.schedule_status = ScheduledJob.SchedJobStatusChoices.SCHEDULED
        sched_job.num_runs += 1
        sched_job.save()
    return f"Scheduled job {sched_job_id} sent to jobserver"
