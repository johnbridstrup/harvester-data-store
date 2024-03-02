from common.tests import HDSAPITestBase
from event.models import Event
from hds.roles import RoleChoices


class HarvJobApiTestBase(HDSAPITestBase):
    def setUp(self):
        super().setUp()
        self.setup_basic()
        self.setup_jobscheduler_data()
        self.set_user_role(RoleChoices.MANAGER)

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
        schema=None,
    ):
        jobtype = jobtype or self.DEFAULT_JOBTYPE
        version = version or self.DEFAULT_SCHEMA_VERSION
        schema = schema or self.DEFAULT_SCHEMA["properties"]["payload"]

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
        self.set_admin()
        results = results or self.DEFAULT_RESULT_SUCCESS
        UUID = UUID or Event.generate_uuid()

        jobresult = {
            **results,
            "uuid": UUID,
            "serial_number": str(self.test_objects["harvester"].harv_id)
        }

        resp = self.client.post(self.jobresults_url, data=jobresult, format="json")
        self.set_user_role(RoleChoices.MANAGER)
        return jobresult, resp