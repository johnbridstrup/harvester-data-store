from common.tests import HDSAPITestBase
from django.urls import reverse

from ..models import JobType, JobSchema


class HarvJobApiTestBase(HDSAPITestBase):
    def setUp(self):
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
        self.jobtype_url = reverse("jobtype-list")
        self.jobtype_detail_url = lambda id_: reverse("jobtype-detail", args=[id_])

        self.jobschema_url = reverse("jobschema-list")
        self.jobschema_detail_url = lambda id_: reverse("jobschema-detail", args=[id_])

        super().setUp()
        self.update_user_permissions_all(JobType)
        self.update_user_permissions_all(JobSchema)
    
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
        schema = schema or self.DEFAULT_SCHEMA_VERSION
        
        jobschema = {
            "jobtype": jobtype, 
            "version": version,
            "schema": schema,
        }

        resp = self.client.post(self.jobschema_url, data=jobschema, format="json")
        return jobschema, resp