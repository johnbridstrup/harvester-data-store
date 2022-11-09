from .HarvJobApiTestBase import HarvJobApiTestBase
from ..models import Job
from ..tasks import JOB_STATUS_MSG_FMT, JOB_SLACK_CHANNEL
from common.utils import build_frontend_url

from rest_framework import status
from unittest.mock import patch

class JobResultApiTestCase(HarvJobApiTestBase):
    @patch("harvjobs.tasks.post_to_slack")
    def test_create_jobresult(self, slack):
        self.create_jobtype()
        self.create_jobschema()
        _, job_resp = self.create_job()
        job_data = job_resp.json()["data"]
        self.assertEqual(job_data["jobstatus"], Job.StatusChoices.PENDING)

        UUID = job_data["event"]["UUID"]

        _, result_resp = self.create_jobresult(UUID=UUID)
        result_data = result_resp.json()["data"]
        
        self.assertEqual(result_resp.status_code, status.HTTP_201_CREATED)

        # Check host results. These are extracted asynchronously so wont
        # be in the POST response
        host_resp = self.client.get(self.jobresults_detail_url(result_data['id']))
        self.assertEqual(host_resp.status_code, status.HTTP_200_OK)
        host_data = host_resp.json()['data']
        self.assertEqual(len(host_data['host_results']), 1)

        # Check filtering by harv id
        endpoint = self.jobresults_url + f'?job__target__harv_id={self.test_objects["harvester"].harv_id}'
        harv_resp = self.client.get(endpoint)
        self.assertEqual(harv_resp.status_code, status.HTTP_200_OK)
        harv_data = harv_resp.json()["data"]
        self.assertEqual(len(harv_data["results"]), 1)

        # Non-existent harvester should have no job results...
        endpoint2 = self.jobresults_url + '?job__target__harv_id=1111111'
        harv_resp2 = self.client.get(endpoint2)
        self.assertEqual(harv_resp2.status_code, status.HTTP_200_OK)
        harv_data2 = harv_resp2.json()["data"]
        self.assertEqual(len(harv_data2["results"]), 0)

        # Assert the job status updates
        updated_job_resp = self.client.get(self.job_detail_urls(result_data["id"]))
        updated_job_data = updated_job_resp.json()["data"]

        self.assertEqual(updated_job_data["jobstatus"], Job.StatusChoices.SUCCESS)

        # Assert post_to_slack called correctly
        self.assertEqual(slack.call_count, 1)

        expect_msg = JOB_STATUS_MSG_FMT.format(
            harv=self.test_objects["harvester"].name,
            result=Job.StatusChoices.SUCCESS,
            UUID=UUID,
            url=build_frontend_url("jobs", 1)
        ) + f"<@{self.user_profile.slack_id}>"

        self.assertEqual(slack.call_args[0][0], expect_msg)
        self.assertDictEqual(slack.call_args[1], {"channel": JOB_SLACK_CHANNEL})
    
    def test_create_fail(self):
        self.create_jobtype()
        self.create_jobschema()
        _, job_resp = self.create_job()
        job_data = job_resp.json()["data"]
        self.assertEqual(job_data["jobstatus"], Job.StatusChoices.PENDING)

        UUID = job_data["event"]["UUID"]

        _, result_resp = self.create_jobresult(UUID=UUID, results=self.DEFAULT_RESULT_FAIL)
        result_data = result_resp.json()["data"]
        
        self.assertEqual(result_resp.status_code, status.HTTP_201_CREATED)

        # Assert the job status updates
        updated_job_resp = self.client.get(self.job_detail_urls(result_data["id"]))
        updated_job_data = updated_job_resp.json()["data"]

        self.assertEqual(updated_job_data["jobstatus"], Job.StatusChoices.FAIL)

    def test_create_error(self):
        self.create_jobtype()
        self.create_jobschema()
        _, job_resp = self.create_job()
        job_data = job_resp.json()["data"]
        self.assertEqual(job_data["jobstatus"], Job.StatusChoices.PENDING)

        UUID = job_data["event"]["UUID"]

        _, result_resp = self.create_jobresult(UUID=UUID, results=self.DEFAULT_RESULT_ERROR)
        result_data = result_resp.json()["data"]
        
        self.assertEqual(result_resp.status_code, status.HTTP_201_CREATED)

        # Assert the job status updates
        updated_job_resp = self.client.get(self.job_detail_urls(result_data["id"]))
        updated_job_data = updated_job_resp.json()["data"]

        self.assertEqual(updated_job_data["jobstatus"], Job.StatusChoices.ERROR)

    def test_create_fail_error(self):
        self.create_jobtype()
        self.create_jobschema()
        _, job_resp = self.create_job()
        job_data = job_resp.json()["data"]
        self.assertEqual(job_data["jobstatus"], Job.StatusChoices.PENDING)

        UUID = job_data["event"]["UUID"]

        result = self.DEFAULT_RESULT_FAIL.copy()
        result["data"]["robot01"] = self.DEFAULT_RESULT_ERROR["data"]["master"]
        _, result_resp = self.create_jobresult(UUID=UUID, results=result)
        result_data = result_resp.json()["data"]
        
        self.assertEqual(result_resp.status_code, status.HTTP_201_CREATED)

        # Assert the job status updates
        updated_job_resp = self.client.get(self.job_detail_urls(result_data["id"]))
        updated_job_data = updated_job_resp.json()["data"]

        self.assertEqual(updated_job_data["jobstatus"], Job.StatusChoices.FAILERROR)

    def test_full_pipeline(self):
        # Testing the process a client might go through.
        # E.g interacting with the jobs list, selecting a job
        # and viewing results.
        self.create_jobtype()
        self.create_jobtype(name="other-job")
        self.create_jobschema()
        self.create_jobschema(version=1.2)
        self.create_jobschema(jobtype="other-job")
        
        # View jobs for a harvester
        harv_jobs_url = f"{self.jobs_url}?target__harv_id={self.test_objects['harvester'].harv_id}"
        resp = self.client.get(harv_jobs_url)
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(len(resp.json()["data"]["results"]), 0)

        # Check available job types
        resp = self.client.get(self.jobtype_url)
        self.assertEqual(resp.status_code, status.HTTP_200_OK)

        # Select job and get the schemas
        jobname = resp.json()["data"]["results"][0]["name"]
        resp = self.client.get(self.jobschema_url + f"?jobtype__name={jobname}")
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(resp.json()["data"]["count"], 2)
        
        # Schedule a job
        _, resp = self.create_job()
        job_data = resp.json()["data"]

        # View pending job
        resp = self.client.get(harv_jobs_url)
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(len(resp.json()["data"]["results"]), 1)
        self.assertEqual(resp.json()["data"]["results"][0]["jobstatus"], Job.StatusChoices.PENDING)

        # No results yet
        results_url = resp.json()["data"]["results"][0]["results"]
        resp = self.client.get(results_url)
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(len(resp.json()["data"]["results"]), 0)

        # Wait for result
        UUID = job_data["event"]["UUID"]
        self.create_jobresult(UUID=UUID)

        # View successful job
        resp = self.client.get(harv_jobs_url)
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(len(resp.json()["data"]["results"]), 1)
        self.assertEqual(resp.json()["data"]["results"][0]["jobstatus"], Job.StatusChoices.SUCCESS)

        # View results
        resp = self.client.get(results_url)
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(len(resp.json()["data"]["results"]), 1)

    def test_history(self):
        self.create_jobtype()
        self.create_jobschema()
        _, job_resp = self.create_job()
        job_data = job_resp.json()["data"]

        UUID = job_data["event"]["UUID"]
        COUNT = 40
        for i in range(COUNT):
            if i%2 == 0:
                self.create_jobresult(UUID=UUID)
            else:
                self.create_jobresult(results=self.DEFAULT_RESULT_FAIL, UUID=UUID)
        url1 = job_data["history"]
        r1 = self.client.get(url1)
        self.assertEqual(r1.status_code, status.HTTP_200_OK)
        d1 = r1.json()["data"]
        self.assertEqual(d1["count"], COUNT+1)
        self.assertIsNone(d1["previous"])
        self.assertIsNotNone(d1["next"])
        
        url2 = r1.json()["data"]["next"]
        r2 = self.client.get(url2)
        self.assertEqual(r2.status_code, status.HTTP_200_OK)
        d2 = r2.json()["data"]
        self.assertIsNotNone(d2["previous"])
        self.assertIsNotNone(d2["next"])
        
        # check all history ids in d1 are greater than all in d2 (more recent)
        check = all([[id1["history_id"] > id2["history_id"] for id2 in d2["results"]] for id1 in d1["results"]])
        self.assertTrue(check)
