from celery import shared_task
from django.contrib.auth.models import User

from .models import Job, JobHostResult, JobResults
from common.serializers.reportserializer import ReportSerializerBase


@shared_task
def job_status_update(UUID, results, jobresult_pk, user_pk):
    job = Job.objects.get(event__UUID=UUID)
    jobresults = JobResults.objects.get(id=jobresult_pk)
    user = User.objects.get(id=user_pk)
    status = Job.StatusChoices.SUCCESS
    fails = False
    errors = False

    for host, result in results.items():
        result_str = result["status"].lower()
        if result_str == "success":
            hostresult = JobHostResult.JobResult.SUCCESS
        elif result_str == "failure":
            hostresult = JobHostResult.JobResult.FAIL
            fails = True
        elif result_str == "error":
            hostresult = JobHostResult.JobResult.ERROR
            errors = True
        
        JobHostResult.objects.create(
            parent=jobresults,
            host=host,
            result=hostresult,
            details=result,
            timestamp=ReportSerializerBase.extract_timestamp(result['ts']),
            creator=user,
        )

    if fails and errors:
        status = Job.StatusChoices.FAILERROR
    elif fails:
        status = Job.StatusChoices.FAIL
    elif errors:
        status = Job.StatusChoices.ERROR
    job.jobstatus = status
    job.save()

    return f"Job {UUID} complete. Status: {status}"
