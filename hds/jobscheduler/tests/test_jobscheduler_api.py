from django.test.client import RequestFactory
from django.urls import reverse
from django.utils import timezone
from django_celery_beat.models import PeriodicTask
from rest_framework import status

from common.utils import build_api_url
from harvjobs.models import Job
from harvjobs.tests.HarvJobApiTestBase import HarvJobApiTestBase
from ..models import ScheduledJob
from ..tasks import run_scheduled_job


class JobSchedulerTestCase(HarvJobApiTestBase):
    def setUp(self):
        super().setUp()
        self.factory = RequestFactory()
        self.url = reverse("jobscheduler-list")
        self.jobsched_payload = {
            "jobtype": self.DEFAULT_JOBTYPE,
            "schema_version": self.DEFAULT_SCHEMA_VERSION,
            "payload": self.DEFAULT_JOB_PAYLOAD,
            "schedule": {
                "clocked": {
                    "clocked_time": str(timezone.now()),
                }
            },
            "targets": {
                "harvesters": [self.test_objects['harvester'].name],
            },
        }

    def _create_defaults(self):
        self.create_jobtype()
        self.create_jobschema()

    def test_create_sched_job_basic(self):
        self._create_defaults()
        r = self.client.post(self.url, self.jobsched_payload, format='json')
        self.assertEqual(r.status_code, status.HTTP_201_CREATED)

    def test_myjobs(self):
        self._create_defaults()

        usr1_client, usr1 = self.create_new_user_client()
        usr2_client, usr2 = self.create_new_user_client()

        # two for user 1
        r = usr1_client.post(self.url, self.jobsched_payload, format='json')
        self.assertEqual(r.status_code, status.HTTP_201_CREATED)
        r = usr1_client.post(self.url, self.jobsched_payload, format='json')
        self.assertEqual(r.status_code, status.HTTP_201_CREATED)

        # one for user 2
        r = usr2_client.post(self.url, self.jobsched_payload, format='json')
        self.assertEqual(r.status_code, status.HTTP_201_CREATED)

        url = reverse("jobscheduler-myjobs")
        r1 = usr1_client.get(url)
        r2 = usr2_client.get(url)

        # assert pagination keys are there
        self.assertTrue("count" in r1.json()["data"])
        self.assertTrue("count" in r2.json()["data"])

        # assert filter works
        for res in r1.json()["data"]["results"]:
            self.assertEqual(res["creator"], usr1.id)

        for res in r2.json()["data"]["results"]:
            self.assertEqual(res["creator"], usr2.id)

    def test_period_task_created(self):
        self._create_defaults()

        self.assertEqual(PeriodicTask.objects.count(), 0)
        self.client.post(self.url, self.jobsched_payload, format='json')
        self.assertEqual(PeriodicTask.objects.count(), 1)

    def test_run_scheduled_job(self):
        self._create_defaults()
        self.client.post(self.url, self.jobsched_payload, format='json')

        run_scheduled_job(1)
        self.assertEqual(Job.objects.count(), 1)

        run_scheduled_job(1)
        self.assertEqual(Job.objects.count(), 2)

    def test_status_updates(self):
        self._create_defaults()
        r = self.client.post(self.url, self.jobsched_payload, format='json')

        # Response will have pending since it is created before perform_create
        self.assertEqual(r.json()['data']['schedule_status'], ScheduledJob.SchedJobStatusChoices.PENDING.value)

        # Job should then be waiting to schedule
        job = ScheduledJob.objects.get()
        self.assertEqual(job.schedule_status, ScheduledJob.SchedJobStatusChoices.WAITING.value)

        # Job should become scheduled
        run_scheduled_job(1)
        job.refresh_from_db()
        self.assertEqual(job.schedule_status, ScheduledJob.SchedJobStatusChoices.SCHEDULED.value)

        # It is not trivial to test the failure cases... Maybe we don't need to but we can revisit.

    def test_scheduler_interface_endpoint(self):
        j1_schem_vers = "36.7a"
        self.create_jobtype(name="job1")
        self.create_jobschema(jobtype="job1")
        self.create_jobschema(jobtype="job1", version=j1_schem_vers) # This should be the first listed schema
        self.create_jobtype(name="job2")
        url = self.url + "create/"
        r = self.client.get(url)
        req = self.factory.get(self.url) # request object for testing

        # Keys exist
        self.assertIn("jobs", r.json()['data'])
        self.assertIn("job1", r.json()['data']['jobs'])
        self.assertIn("job2", r.json()['data']['jobs'])

        # select jobtype, select schema, get form
        form_url = r.json()['data']['jobs']['job1'].get(j1_schem_vers)["url"]
        self.assertIsNotNone(url, f"Missing URL for job1 schema {j1_schem_vers}")

        form_r = self.client.get(form_url)
        self.assertEqual(form_r.status_code, status.HTTP_200_OK)

        # Submit linked correctly
        exp_sub_url = build_api_url(req, self.url, params={"jobtype": "job1", "schema_version": j1_schem_vers})
        self.assertEqual(exp_sub_url, form_r.json()['data']['submit'])

        # Using correct schema in payload
        resp_schema = form_r.json()['data']['form']['properties']['payload']
        self.assertDictEqual(resp_schema, self.DEFAULT_SCHEMA)

    def test_filter_scheduledjobs(self):
        self._create_defaults()
        r = self.client.post(self.url, self.jobsched_payload, format='json')
        self.assertEqual(r.status_code, status.HTTP_201_CREATED)

        # filter by jobtype positive
        res = self.client.get(f'{self.url}?jobtype={self.jobsched_payload["jobtype"]}')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.json()['data']['count'], 1)

        # filter by jobtype negative
        res = self.client.get(f'{self.url}?jobtype=unknown')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.json()['data']['count'], 0)

        # filter by schema version positive
        res = self.client.get(f'{self.url}?schema_version={self.jobsched_payload["schema_version"]}')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.json()['data']['count'], 1)

        # filter by schema version negative
        res = self.client.get(f'{self.url}?schema_version=10.0')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.json()['data']['count'], 0)

        # filter by jobtype and schema version
        res = self.client.get(f'{self.url}?jobtype={self.jobsched_payload["jobtype"]}&schema_version={self.jobsched_payload["schema_version"]}')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.json()['data']['count'], 1)
