from unittest.mock import patch

from rest_framework import status

from hds.roles import RoleChoices
from .HarvJobApiTestBase import HarvJobApiTestBase
from ..models import Job


class JobApiTestCase(HarvJobApiTestBase):
    @patch("harvjobs.views.jobviews.schedule_job.delay")
    def test_create_job(self, task):
        self.create_jobtype()
        self.create_jobschema()
        _, job_resp = self.create_job()

        self.assertEqual(job_resp.status_code, status.HTTP_201_CREATED)
        job_resp = self.client.get(self.job_det_urls(job_resp.data["id"]))
        self.assertEqual(job_resp.status_code, status.HTTP_200_OK)

        # Assert status is pending
        job_data = job_resp.json()["data"]
        self.assertEqual(job_data["jobstatus"], Job.StatusChoices.PENDING)

        # Assert an event is created
        event_resp = self.client.get(self.event_det_url(1))
        self.assertEqual(event_resp.status_code, status.HTTP_200_OK)

        # Assert the UUIDs match
        event_data = event_resp.json()["data"]
        self.assertEqual(event_data["UUID"], job_data["event"]["UUID"])

        # Assert celery task was called
        self.assertEqual(task.call_count, 1)

    @patch("harvjobs.views.jobviews.schedule_job.delay")
    def test_create_job_non_whitelisted(self, task):
        JOBTYPE_403 = "not-whitelisted"
        self.create_jobtype(name=JOBTYPE_403)
        self.create_jobschema(jobtype=JOBTYPE_403)
        self.set_user_role(RoleChoices.SUPPORT)
        _, resp = self.create_job(jobtype=JOBTYPE_403)

        self.assertEqual(resp.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(task.call_count, 0)

        self.set_user_role(RoleChoices.MANAGER)
        _, resp = self.create_job(jobtype=JOBTYPE_403)
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)
        self.assertEqual(task.call_count, 1)

    def test_missing_required_arg(self):
        self.create_jobtype()
        self.create_jobschema()

        bad_payload = self.DEFAULT_JOB_PAYLOAD.copy()
        del bad_payload["payload"]["requiredArg"]
        _, resp = self.create_job(job_payload=bad_payload)

        self.assertContains(
            response=resp,
            text="'requiredArg' is a required property",
            status_code=status.HTTP_400_BAD_REQUEST,
        )

    def test_missing_optional_arg(self):
        self.create_jobtype()
        self.create_jobschema()

        good_payload = self.DEFAULT_JOB_PAYLOAD.copy()
        del good_payload["payload"]["optionalArg"]
        _, resp = self.create_job(job_payload=good_payload)

        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)

    def test_invalid_arg_type(self):
        self.create_jobtype()
        self.create_jobschema()

        bad_payload = self.DEFAULT_JOB_PAYLOAD.copy()
        bad_payload["payload"]["requiredArg"] = ["bad", "args"]
        _, resp = self.create_job(job_payload=bad_payload)

        self.assertContains(
            response=resp,
            text="Must be string",
            status_code=status.HTTP_400_BAD_REQUEST,
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

        resp2 = self.client.get(self.job_det_urls(2))
        self.assertEqual(resp2.status_code, status.HTTP_200_OK)

        data = resp2.json()["data"]
        self.assertDictContainsSubset(payload["payload"], data["payload"])

        # Assert both events were created
        event_resp = self.client.get(f"{self.api_base_url}/events/")
        self.assertEqual(event_resp.status_code, status.HTTP_200_OK)
        event_data = event_resp.json()["data"]
        self.assertEqual(event_data["count"], 2)

    @patch("harvjobs.views.jobviews.schedule_job.delay")
    def test_reschedule_job(self, patched_task):
        """Test reschedule a job."""
        self.create_jobtype()
        self.create_jobschema()
        _, job_resp = self.create_job()

        self.assertEqual(job_resp.status_code, status.HTTP_201_CREATED)

        res = self.client.get(self.reschedule_url(job_resp.data["id"]))

        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(patched_task.call_count, 2)
        patched_task.assert_called_with(
            job_resp.data["id"], job_resp.data["target"], job_resp.data["creator"]
        )
