from celery import shared_task
import logging, json
from django.contrib.auth.models import User

from .models import Job, JobHostResult, JobResults
from common.serializers.reportserializer import ReportSerializerBase
from common.utils import build_frontend_url
from harvester.models import Harvester
from notifications.slack import post_to_slack

import datetime, logging, os, pytz, requests, sys
from requests.adapters import Retry, HTTPAdapter


JOB_STATUS_MSG_FMT = (
    "*Job Complete*\n"
    "\tRESULT: {result}"
    "\tUUID: {UUID}\n"
    "\tURL: {url}\n"
)

FAILED_TO_SEND_FMT = (
    "*Job Failed to send*\n"
    "\tUUID: {UUID}\n"
    "\tURL: {url}\n"
)

JOB_SLACK_CHANNEL = "hds-jobs"
JOB_SERVER_ADDRESS = os.environ.get("JOB_SERVER_ADDRESS", "http://iot-job-server.cloud.advanced.farm:8000")
if sys.argv[1:2] == ['test']:
    JOB_SERVER_ADDRESS = "http://httpbin.org/anything"
JOB_SUBSYSTEM = "http://localhost:5000"
JOB_DATETIME_FMT = "%Y-%m-%d %H:%M:%S"
MAX_RETRIES = 4


@shared_task
def job_status_update(UUID, results, jobresult_pk, user_pk, url):
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

    msg = JOB_STATUS_MSG_FMT.format(
        result=status,
        UUID=UUID,
        url=url,
    )
    if job.creator.profile.slack_id is not None:
        msg += f"<@{job.creator.profile.slack_id}>"
        
    post_to_slack(msg, channel=JOB_SLACK_CHANNEL)

    return f"Job {UUID} complete. Status: {status}"

@shared_task
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
    logging.info("Sending job to server.")
    logging.info(json.dumps(request_payload))
    logging.info("/".join([JOB_SERVER_ADDRESS, "job"]))

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
    r = session.post("/".join([JOB_SERVER_ADDRESS, "job"]), json=request_payload, timeout=5, verify=True)

    try:
        r.raise_for_status()
    except requests.exceptions.HTTPError as err:
        logging.error(err.response.text)
        job.jobstatus = Job.StatusChoices.UNSENT
        job.save()
        url = build_frontend_url("jobs", _id=job_id)
        msg = FAILED_TO_SEND_FMT.format(UUID=job.event.UUID, url=url)

        if job.creator.profile.slack_id is not None:
            msg += f"<@{job.creator.profile.slack_id}>"
        post_to_slack(msg, channel=JOB_SLACK_CHANNEL)
