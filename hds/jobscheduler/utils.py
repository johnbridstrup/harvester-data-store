from django_celery_beat.models import PeriodicTask

from common.exceptions import FeatureNotEnabled
from .models import ScheduledJob
from .serializers import IntervalScheduleSerializer, CronTabScheduleSerializer, ClockedScheduleSerializer


TASK_NAME = "jobscheduler.tasks.run_scheduled_job"

def _get_schedule_instance(sched_def):
    if "interval" in sched_def:
        raise FeatureNotEnabled("Interval scheduling not enabled")
        int_sched_ser = IntervalScheduleSerializer(data=sched_def['interval'])
        int_sched_ser.is_valid()
        inst = int_sched_ser.save()
        return {"interval": inst}
    elif "crontab" in sched_def:
        raise FeatureNotEnabled("Crontab scheduling not enabled")
        cron_sched_ser = CronTabScheduleSerializer(data=sched_def['crontab'])
        cron_sched_ser.is_valid()
        inst = cron_sched_ser.save()
        return {"crontab": inst}
    elif "clocked" in sched_def:
        clocked_sched_ser = ClockedScheduleSerializer(data=sched_def['clocked'])
        clocked_sched_ser.is_valid()
        inst = clocked_sched_ser.save()
        return {"clocked": inst, "one_off": True}


def create_periodic_task(sched_job_id):
    sched_job = ScheduledJob.objects.get(id=sched_job_id)
    job_def = sched_job.job_def
    sched = _get_schedule_instance(job_def["schedule"])
    task_fields = {
        "task": TASK_NAME,
        "name": f"scheduled_job_{sched_job_id}_{job_def['jobtype']}",
        "args": [sched_job_id],
        **sched,
    }
    per_task = PeriodicTask(**task_fields)
    per_task.save()

    sched_job.task = per_task
    sched_job.schedule_status = ScheduledJob.SchedJobStatusChoices.WAITING
    sched_job.save()
    return f"Created periodic task: {per_task}"
