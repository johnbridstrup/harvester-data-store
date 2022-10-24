from common.tests import HDSAPITestBase
from event.models import Event
from django.urls import reverse

from ..models import JobType, JobSchema, Job, JobResults, JobHostResult


class HarvJobApiTestBase(HDSAPITestBase):
    def setUp(self):
        super().setUp()
        self.DEFAULT_JOBTYPE = "test-job"
        self.DEFAULT_SCHEMA_VERSION = "0.1"
        self.DEFAULT_SCHEMA = {
            "type": "object",
            "properties": {
                "id": {
                    "type": "string",
                },
                "job_type": {
                    "type": "string",
                },
                "targets": {
                    "type": "array",
                    "items": {
                        "type": "string",
                        "pattern": "^(master|((robot|stereo)\\d+))$"
                    },
                },
                "requiredArg": {
                    "type": "string",
                },
                "optionalArg": {
                    "type": "string",
                },
            },
            "required": ["id", "job_type", "requiredArg", "targets"],
        }
        self.DEFAULT_JOB_PAYLOAD = {
            "requiredArg": "some value",
            "optionalArg": "some other value",
            "targets": ["master"],
        }
        self.DEFAULT_RESULT_SUCCESS = {
            "data": {
                "master": {
                    "ts": 1666048158.12822,
                    "exit_code": 0,
                    "stdout": "",
                    "stderr": "",
                    "status": "success"
                }
            },
            "timestamp": 1666048158.1355963,
            "type": "jobresults"
        }
        self.DEFAULT_RESULT_FAIL = {
            "data": {
                "master": {
                    "ts": 1666048159.12822,
                    "exit_code": 1,
                    "stdout": "",
                    "stderr": "",
                    "status": "failure"
                }
            },
            "timestamp": 1666048158.1355963,
            "type": "jobresults"
        }
        self.DEFAULT_RESULT_ERROR = {
            "data": {
                "master": {
                    "ts": 1666048159.12822,
                    "type": "Exception",
                    "value": "An Exception occurred",
                    "traceback": "Bad things happened on line 99",
                    "status": "error"
                }
            },
            "timestamp": 1666048158.1355963,
            "type": "jobresults"
        }
        self.jobtype_url = reverse("jobtype-list")
        self.jobtype_detail_url = lambda id_: reverse("jobtype-detail", args=[id_])

        self.jobschema_url = reverse("jobschema-list")
        self.jobschema_detail_url = lambda id_: reverse("jobschema-detail", args=[id_])

        self.jobs_url = reverse("job-list")
        self.job_detail_urls = lambda id_: reverse("job-detail", args=[id_])

        self.jobresults_url = reverse("jobresults-list")
        self.jobresults_detail_url = lambda id_: reverse("jobresults-detail", args=[id_])

        self.test_objects = self._setup_basic()
        self.update_user_permissions_all(JobType)
        self.update_user_permissions_all(JobSchema)
        self.update_user_permissions_all(Job)
        self.update_user_permissions_all(JobResults)
        self.update_user_permissions_all(JobHostResult)
    
    def create_jobtype(self, name=None):
        name = name or self.DEFAULT_JOBTYPE
        
        jobtype = {
            "name": name
        }
        resp = self.client.post(self.jobtype_url, data=jobtype, format="json")
        return jobtype, resp

    def create_jobschema(
        self, 
        jobtype=None, 
        version=None, 
        schema=None
    ):
        jobtype = jobtype or self.DEFAULT_JOBTYPE
        version = version or self.DEFAULT_SCHEMA_VERSION
        schema = schema or self.DEFAULT_SCHEMA
        
        jobschema = {
            "jobtype": jobtype, 
            "version": version,
            "schema": schema,
        }

        resp = self.client.post(self.jobschema_url, data=jobschema, format="json")
        return jobschema, resp

    def create_job(
        self,
        jobtype=None,
        version=None,
        job_payload=None
    ):
        jobtype = jobtype or self.DEFAULT_JOBTYPE
        version = version or self.DEFAULT_SCHEMA_VERSION
        job_payload = job_payload or self.DEFAULT_JOB_PAYLOAD

        job = {
            "target": str(self.test_objects["harvester"].harv_id),
            "jobtype": jobtype,
            "schema_version": version,
            "payload": job_payload,
        }

        resp = self.client.post(self.jobs_url, data=job, format="json")

        return job, resp

    def create_jobresult(
        self,
        UUID=None,
        results=None
    ):
        results = results or self.DEFAULT_RESULT_SUCCESS
        UUID = UUID or Event.generate_uuid()

        jobresult = {
            **results,
            "uuid": UUID,
            "serial_number": str(self.test_objects["harvester"].harv_id)
        }

        resp = self.client.post(self.jobresults_url, data=jobresult, format="json")

        return jobresult, resp