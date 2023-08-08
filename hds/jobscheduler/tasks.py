from celery import Task

from common.celery import monitored_shared_task
from event.models import Event
from harvjobs.models import Job, JobSchema
from harvjobs.tasks import schedule_job
from .models import ScheduledJob


class RunSchedCallback(Task):
    def on_failure(self, exc, task_id, args, kwargs, einfo):
        job = ScheduledJob.objects.get(id=args[0])
        job.schedule_status = ScheduledJob.SchedJobStatusChoices.SCHEDFAIL
        job.save()


@monitored_shared_task(base=RunSchedCallback)
def run_scheduled_job(sched_job_id):
    sched_job = ScheduledJob.objects.get(id=sched_job_id)
    schema = JobSchema.objects.get(
        jobtype__name=sched_job.job_def["jobtype"],
        version=sched_job.job_def["schema_version"],
    )
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
        sched_job.save()
    return f"Scheduled job {sched_job_id} sent to jobserver"
