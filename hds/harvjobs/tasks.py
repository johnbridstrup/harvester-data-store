import json
from django.contrib.auth.models import User

from .models import Job, JobHostResult, JobResults
from common.celery import monitored_shared_task
from common.serializers.reportserializer import ReportSerializerBase
from common.utils import build_frontend_url, test_env
from harvester.models import Harvester
from notifications.slack import post_to_slack

import datetime, os, pytz, requests, structlog, sys
from requests.adapters import Retry, HTTPAdapter

logger = structlog.get_logger(__name__)


JOB_STATUS_MSG_FMT = (
    "*Job Complete*\n"
    "\tHARVESTER: {harv}\n"
    "\tRESULT: {result}\n"
    "\tUUID: {UUID}\n"
    "\tURL: {url}\n"
)

FAILED_TO_SEND_FMT = (
    "*Job Failed to send*\n"
    "\tHARVESTER: {harv}\n"
    "\tUUID: {UUID}\n"
    "\tEXCEPTION: {exc}\n"
    "\tURL: {url}\n"
)

JOB_SLACK_CHANNEL = "hds-jobs"
JOB_SERVER_ADDRESS = os.environ.get("JOB_SERVER_ADDRESS", "http://iot-job-server.cloud.advanced.farm:8000")
if test_env():
    JOB_SERVER_ADDRESS = "http://httpbin.org/anything"
JOB_SUBSYSTEM = "http://localhost:5000"
JOB_DATETIME_FMT = "%Y-%m-%d %H:%M:%S"
MAX_RETRIES = 4


@monitored_shared_task
def job_status_update(UUID, results, jobresult_pk, user_pk, url):
    job = Job.objects.get(event__UUID=UUID)
    harv = Harvester.objects.get(id=job.target.id)
    jobresults = JobResults.objects.get(id=jobresult_pk)
    user = User.objects.get(id=user_pk)
    status = Job.StatusChoices.SUCCESS
    fails = False
    errors = False
    canceled = False

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
        elif result_str in ["canceled", "cancelled"]:
            hostresult = JobHostResult.JobResult.CANCELED
            canceled = True
        
        JobHostResult.objects.create(
            parent=jobresults,
            host=host,
            result=hostresult,
            details=result,
            timestamp=ReportSerializerBase.extract_timestamp(result, key="ts"),
            creator=user,
        )

    if canceled:
        status = Job.StatusChoices.CANCELED
    elif fails and errors:
        status = Job.StatusChoices.FAILERROR
    elif fails:
        status = Job.StatusChoices.FAIL
    elif errors:
        status = Job.StatusChoices.ERROR
    job.jobstatus = status
    job.save()

    msg = JOB_STATUS_MSG_FMT.format(
        harv=harv.name,
        result=status,
        UUID=UUID,
        url=url,
    )
    if job.creator.profile.slack_id is not None:
        msg += f"<@{job.creator.profile.slack_id}>"
        
    post_to_slack(msg, channel=JOB_SLACK_CHANNEL)

    return f"Job {UUID} complete. Status: {status}"

@monitored_shared_task
def schedule_job(job_id, harv_pk, user_pk):
    # eventually this will send the payload to the job server
    job = Job.objects.get(id=job_id)
    harv = Harvester.objects.get(id=harv_pk)
    hv_name = harv.thingName or f"hv-{harv.harv_id:03}"
    identity = User.objects.get(id=user_pk).username
    
    request_payload = {
        "hv_name": hv_name,
        "operator": identity,
        "hv_subsystem": JOB_SUBSYSTEM,
        "job_payload": json.dumps(job.payload),
        "valid_until": (datetime.datetime.now(pytz.utc) + datetime.timedelta(seconds=3600)).strftime(JOB_DATETIME_FMT)
    }
    logger.info("Sending job to server.", jobserver="/".join([JOB_SERVER_ADDRESS, "job"]))
    logger.debug(json.dumps(request_payload))

    retry = Retry(
        total=MAX_RETRIES,
        backoff_factor=0.1,
        status_forcelist=[
            500, # Internal server error (generic)
            502, # Bad gateway
            503, # Service unavailable
            504, # Gateway timeout
        ],
        allowed_methods=frozenset(['POST'])
    )
    session = requests.session()
    session.mount("http://", HTTPAdapter(max_retries=retry))

    try:
        r = session.post("/".join([JOB_SERVER_ADDRESS, "job"]), json=request_payload, timeout=5, verify=True)
        r.raise_for_status()
        return f"Job {job.event.UUID} sent to server."

    except Exception as err:
        job.jobstatus = Job.StatusChoices.UNSENT
        job.save()
        url = build_frontend_url("jobs", _id=job_id)
        msg = FAILED_TO_SEND_FMT.format(
            harv=harv.name, 
            UUID=job.event.UUID,
            exc=err.__class__.__name__, 
            url=url,
        )

        if job.creator.profile.slack_id is not None:
            msg += f"<@{job.creator.profile.slack_id}>"
        post_to_slack(msg, channel=JOB_SLACK_CHANNEL)
        raise
