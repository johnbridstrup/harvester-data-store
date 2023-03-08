from common.celery import monitored_shared_task

from .models import ScheduledJob


@monitored_shared_task
def run_scheduled_job(sched_job_id):
    # Will implement later. Must be here to created ScheduledJob instance
    pass