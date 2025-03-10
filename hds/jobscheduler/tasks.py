import jsonschema
import structlog
from celery import Task, current_app as celery_app
from kombu.utils.json import loads
from django.template.defaultfilters import pluralize

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

    job_def = sched_job.job_def["payload"].copy()
    if schema.is_dynamic:
        job_def = schema.payload_from_dynamic(job_def)

    try:
        jsonschema.validate(
            job_def["payload"], schema.schema["properties"]["payload"]
        )
    except jsonschema.ValidationError as e:
        sched_job.schedule_status = ScheduledJob.SchedJobStatusChoices.SCHEDFAIL
        sched_job.task.enabled = False
        sched_job.save()
        logger.exception(e)
        return "Failed to validate payload"

    harvs = sched_job.targets.all()
    job_obj = {
        "schema": schema,
        "payload": job_def,
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
        if sched_job.max_runs > 0 and sched_job.num_runs >= sched_job.max_runs:
            sched_job.task.enabled = False
            sched_job.task.save()
            sched_job.schedule_status = (
                ScheduledJob.SchedJobStatusChoices.MAXRUNS
            )
        sched_job.save()
    return f"Scheduled job {sched_job_id} sent to jobserver"


def run_tasks(queryset):
    """
    Utility function to manually run the tasks.

    Args:
        queryset: Queryset[PeriodicTask]

    Returns:
        str
    """
    celery_app.loader.import_default_modules()
    tasks = [
        (
            celery_app.tasks.get(task.task),
            loads(task.args),
            loads(task.kwargs),
            task.queue,
            task.name,
        )
        for task in queryset
    ]

    if any(t[0] is None for t in tasks):
        for i, t in enumerate(tasks):
            if t[0] is None:
                break

        # variable "i" will be set because list "tasks" is not empty
        not_found_task_name = queryset[i].task

        err_msg = f"task {not_found_task_name} not found"
        logger.error(err_msg)
        return err_msg

    task_ids = [
        task.apply_async(
            args=args,
            kwargs=kwargs,
            queue=queue,
            periodic_task_name=periodic_task_name,
        )
        if queue and len(queue)
        else task.apply_async(
            args=args, kwargs=kwargs, periodic_task_name=periodic_task_name
        )
        for task, args, kwargs, queue, periodic_task_name in tasks
    ]
    tasks_run = len(task_ids)
    return ("{0} task{1} {2} successfully run").format(
        tasks_run,
        pluralize(tasks_run),
        pluralize(tasks_run, ("was,were")),
    )
