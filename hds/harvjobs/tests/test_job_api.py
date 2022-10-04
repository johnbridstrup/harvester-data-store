from .HarvJobApiTestBase import HarvJobApiTestBase
from ..models import Job

from rest_framework import status


class JobApiTestCase(HarvJobApiTestBase):
    def test_create_job(self):
        self.create_jobtype()
        self.create_jobschema()
        _, job_resp = self.create_job()
        
        self.assertEqual(job_resp.status_code, status.HTTP_201_CREATED)

        # Assert status is pending
        job_data = job_resp.json()["data"]
        self.assertEqual(job_data['jobstatus'], Job.StatusChoices.PENDING)

        # Assert an event is created
        event_resp = self.client.get(f"{self.api_base_url}/events/1/")
        self.assertEqual(event_resp.status_code, status.HTTP_200_OK)

        # Assert the UUIDs match
        event_data = event_resp.json()["data"]
        
        self.assertEqual(event_data["UUID"], job_data["event"]["UUID"])

    def test_missing_required_arg(self):
        self.create_jobtype()
        self.create_jobschema()

        bad_payload = self.DEFAULT_JOB_PAYLOAD.copy()
        del bad_payload["requiredArg"]
        _, resp = self.create_job(job_payload=bad_payload)
        
        self.assertContains(
            response=resp, 
            text="'requiredArg' is a required property", 
            status_code=status.HTTP_400_BAD_REQUEST
        )

    def test_missing_optional_arg(self):
        self.create_jobtype()
        self.create_jobschema()

        good_payload = self.DEFAULT_JOB_PAYLOAD.copy()
        del good_payload["optionalArg"]
        _, resp = self.create_job(job_payload=good_payload)
        
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)

    def test_invalid_arg_type(self):
        self.create_jobtype()
        self.create_jobschema()

        bad_payload = self.DEFAULT_JOB_PAYLOAD.copy()
        bad_payload["requiredArg"] = ["bad", "args"]
        _, resp = self.create_job(job_payload=bad_payload)

        self.assertContains(
            response=resp, 
            text="Must be string", 
            status_code=status.HTTP_400_BAD_REQUEST
        )

    def test_get_jobs(self):
        self.create_jobtype()
        self.create_jobschema()
        self.create_job()
        payload, _ = self.create_job()

        resp = self.client.get(self.jobs_url)
        self.assertEqual(resp.status_code, status.HTTP_200_OK)

        data = resp.json()["data"]
        self.assertEqual(data["count"], 2)

        resp2 = self.client.get(self.job_detail_urls(2))
        self.assertEqual(resp2.status_code, status.HTTP_200_OK)

        data = resp2.json()["data"]
        self.assertDictContainsSubset(payload["payload"], data["payload"])

        # Assert both events were created
        event_resp = self.client.get(f"{self.api_base_url}/events/")
        self.assertEqual(event_resp.status_code, status.HTTP_200_OK)
        event_data = event_resp.json()["data"]
        self.assertEqual(event_data["count"], 2)