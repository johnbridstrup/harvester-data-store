import pytz, time

from django.test.client import RequestFactory
from django.urls import reverse
from django.utils import timezone
from django_celery_beat.models import PeriodicTask
from rest_framework import status

from common.utils import build_api_url
from harvjobs.models import Job
from harvjobs.tests.HarvJobApiTestBase import HarvJobApiTestBase
from harvjobs.dynamic_keys import DynamicKeys
from ..models import ScheduledJob
from ..serializers import ScheduledJobSerializer
from ..tasks import run_scheduled_job


DT_REGEX = "(^2[0-9]{3}[0-1][0-9][0-3][0-9][0-2][0-9]{3}([0-5][0-9])?$)"


class JobSchedulerTestCase(HarvJobApiTestBase):
    def setUp(self):
        super().setUp()
        self.factory = RequestFactory()
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
                "harvesters": [self.test_objects["harvester"].name],
            },
        }

    def _create_defaults(self):
        self.create_jobtype()
        self.create_jobschema()

    def test_create_sched_job_basic(self):
        self._create_defaults()
        r = self.client.post(self.job_sched_url, self.jobsched_payload, format="json")
        self.assertEqual(r.status_code, status.HTTP_202_ACCEPTED)

    def test_invalid_no_jobtype_or_schema(self):
        self._create_defaults()
        del self.jobsched_payload["jobtype"]
        del self.jobsched_payload["schema_version"]
        r = self.client.post(self.job_sched_url, self.jobsched_payload, format="json")
        self.assertEqual(r.status_code, status.HTTP_400_BAD_REQUEST)
        err = r.json()["errors"]["detail"]
        exp_err = {
            ScheduledJobSerializer.Msgs.MISSING_KEY: [
                ScheduledJobSerializer.Msgs.NO_JOBTYPE,
                ScheduledJobSerializer.Msgs.NO_VERS,
            ]
        }
        self.assertDictEqual(err, exp_err)

    def test_invalid_missing_payload_schema(self):
        self._create_defaults()
        del self.jobsched_payload["payload"]["payload"]
        BAD_VERS = "That Doesn't Exist"
        self.jobsched_payload["schema_version"] = BAD_VERS
        r = self.client.post(self.job_sched_url, self.jobsched_payload, format="json")
        self.assertEqual(r.status_code, status.HTTP_400_BAD_REQUEST)
        err = r.json()["errors"]["detail"]
        exp_err = {
            ScheduledJobSerializer.Msgs.MISSING_KEY: ScheduledJobSerializer.Msgs.NO_PAYLOAD,
            **ScheduledJobSerializer.Msgs.NO_SCHEMA("test", BAD_VERS),
        }
        self.assertDictEqual(err, exp_err)

    def test_invalid_payload(self):
        self._create_defaults()
        del self.jobsched_payload["payload"]["payload"]["requiredArg"]
        r = self.client.post(self.job_sched_url, self.jobsched_payload, format="json")
        self.assertEqual(r.status_code, status.HTTP_400_BAD_REQUEST)

        err = r.json()["errors"]["detail"]
        self.assertIn("invalid", err)
        self.assertIn("'requiredArg' is a required property", err["invalid"])

    def test_myjobs(self):
        self._create_defaults()

        usr1_client, usr1 = self.create_new_user_client()
        usr2_client, usr2 = self.create_new_user_client()

        # two for user 1
        r = usr1_client.post(self.job_sched_url, self.jobsched_payload, format="json")
        self.assertEqual(r.status_code, status.HTTP_202_ACCEPTED)
        r = usr1_client.post(self.job_sched_url, self.jobsched_payload, format="json")
        self.assertEqual(r.status_code, status.HTTP_202_ACCEPTED)

        # one for user 2
        r = usr2_client.post(self.job_sched_url, self.jobsched_payload, format="json")
        self.assertEqual(r.status_code, status.HTTP_202_ACCEPTED)

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
        self.client.post(self.job_sched_url, self.jobsched_payload, format="json")
        self.assertEqual(PeriodicTask.objects.count(), 1)

    def test_run_scheduled_job(self):
        self._create_defaults()
        self.client.post(self.job_sched_url, self.jobsched_payload, format="json")

        run_scheduled_job(1)
        self.assertEqual(Job.objects.count(), 1)

        run_scheduled_job(1)
        self.assertEqual(Job.objects.count(), 2)

    def test_num_jobs_incr(self):
        self._create_defaults()
        self.client.post(self.job_sched_url, self.jobsched_payload, format="json")

        run_scheduled_job(1)
        self.assertEqual(Job.objects.count(), 1)

        schedjob = ScheduledJob.objects.get(id=1)
        self.assertEqual(schedjob.num_runs, 1)

    def test_max_jobs_reached(self):
        self._create_defaults()
        self.jobsched_payload["max_runs"] = 2
        self.client.post(self.job_sched_url, self.jobsched_payload, format="json")

        run_scheduled_job(1)
        run_scheduled_job(1)

        schedjob = ScheduledJob.objects.get(id=1)
        self.assertEqual(
            schedjob.schedule_status, ScheduledJob.SchedJobStatusChoices.MAXRUNS
        )
        self.assertFalse(schedjob.task.enabled)

    def test_status_updates(self):
        self._create_defaults()
        r = self.client.post(self.job_sched_url, self.jobsched_payload, format="json")

        # Response will have pending since it is created before perform_create
        self.assertEqual(
            r.json()["data"]["schedule_status"],
            ScheduledJob.SchedJobStatusChoices.PENDING.value,
        )

        # Job should then be waiting to schedule
        job = ScheduledJob.objects.get()
        self.assertEqual(
            job.schedule_status, ScheduledJob.SchedJobStatusChoices.WAITING.value
        )

        # Job should become scheduled
        run_scheduled_job(1)
        job.refresh_from_db()
        self.assertEqual(
            job.schedule_status, ScheduledJob.SchedJobStatusChoices.SCHEDULED.value
        )

        # It is not trivial to test the failure cases... Maybe we don't need to but we can revisit.

    def test_scheduler_interface_endpoint(self):
        j1_schem_vers = "36.7a"
        self.create_jobtype(name="job1")
        self.create_jobschema(jobtype="job1")
        self.create_jobschema(
            jobtype="job1", version=j1_schem_vers
        )  # This should be the first listed schema
        self.create_jobtype(name="job2")
        url = self.job_sched_url + "create/"
        r = self.client.get(url)
        req = self.factory.get(self.job_sched_url)  # request object for testing

        # Keys exist
        self.assertIn("jobs", r.json()["data"])
        self.assertIn("job1", r.json()["data"]["jobs"])
        self.assertIn("job2", r.json()["data"]["jobs"])

        # select jobtype, select schema, get form
        form_url = r.json()["data"]["jobs"]["job1"].get(j1_schem_vers)["url"]
        self.assertIsNotNone(url, f"Missing URL for job1 schema {j1_schem_vers}")

        form_r = self.client.get(form_url)
        self.assertEqual(form_r.status_code, status.HTTP_200_OK)

        # Submit linked correctly
        exp_sub_url = build_api_url(
            req,
            self.job_sched_url,
            params={"jobtype": "job1", "schema_version": j1_schem_vers},
        )
        self.assertEqual(exp_sub_url, form_r.json()["data"]["submit"])

        # Using correct schema in payload
        resp_schema = form_r.json()["data"]["form"]["properties"]["payload"]
        self.assertDictEqual(resp_schema, self.DEFAULT_SCHEMA)

    def test_filter_scheduledjobs(self):
        self._create_defaults()
        r = self.client.post(self.job_sched_url, self.jobsched_payload, format="json")
        self.assertEqual(r.status_code, status.HTTP_202_ACCEPTED)

        # filter by jobtype positive
        res = self.client.get(
            f'{self.job_sched_url}?jobtype={self.jobsched_payload["jobtype"]}'
        )
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.json()["data"]["count"], 1)

        # filter by jobtype negative
        res = self.client.get(f"{self.job_sched_url}?jobtype=unknown")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.json()["data"]["count"], 0)

        # filter by schema version positive
        res = self.client.get(
            f'{self.job_sched_url}?schema_version={self.jobsched_payload["schema_version"]}'
        )
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.json()["data"]["count"], 1)

        # filter by schema version negative
        res = self.client.get(f"{self.job_sched_url}?schema_version=10.0")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.json()["data"]["count"], 0)

        # filter by jobtype and schema version
        res = self.client.get(
            f'{self.job_sched_url}?jobtype={self.jobsched_payload["jobtype"]}&schema_version={self.jobsched_payload["schema_version"]}'
        )
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.json()["data"]["count"], 1)

    def test_dynamic_key_schema_updated(self):
        self.DEFAULT_SCHEMA["allow_repeat_schedules"] = True
        self.DEFAULT_SCHEMA["dynamic_keys"] = ["requiredArg"]
        dyn_req_arg = DynamicKeys._create_dyn_key_name("requiredArg")

        self.create_jobtype()
        self.create_jobschema()

        url = self.job_sched_url + "create/"
        r = self.client.get(url)

        form_url = r.json()["data"]["jobs"][self.DEFAULT_JOBTYPE][
            self.DEFAULT_SCHEMA_VERSION
        ]["url"]
        form_r = self.client.get(form_url)

        self.assertEqual(form_r.status_code, status.HTTP_200_OK, form_r.json())

        form_payload_schema = form_r.json()["data"]["form"]["properties"]["payload"][
            "properties"
        ]["payload"]
        self.assertIn(dyn_req_arg, form_payload_schema["properties"])
        self.assertIn(dyn_req_arg, form_payload_schema["required"])

    def test_dynamic_time_of_schedule(self):
        self.DEFAULT_SCHEMA["allow_repeat_schedules"] = True
        self.DEFAULT_SCHEMA["dynamic_keys"] = ["requiredArg"]
        self.DEFAULT_SCHEMA["properties"]["payload"]["properties"]["requiredArg"][
            "pattern"
        ] = DT_REGEX

        self.create_jobtype()
        self.create_jobschema()

        url = self.job_sched_url + "create/"
        r = self.client.get(url)
        form_url = r.json()["data"]["jobs"][self.DEFAULT_JOBTYPE][
            self.DEFAULT_SCHEMA_VERSION
        ]["url"]
        form_r = self.client.get(form_url)
        submit_url = form_r.json()["data"]["submit"]

        TOS_payload = {}
        fmt = "%Y%m%d%H%M%S"
        hrs_sub = -6
        TOS_payload["payload"] = {
            "__dynamic__requiredArg": {
                "selection": "TimeOfSchedule",
                "value": {
                    "format": fmt,
                    "hours": hrs_sub,
                },
            },
            "optionalArg": "hello",
        }

        self.jobsched_payload["payload"] = TOS_payload
        r = self.client.post(submit_url, self.jobsched_payload, format="json")

        self.assertEqual(
            r.status_code,
            status.HTTP_202_ACCEPTED,
            {"code": r.status_code, "exc": r.json()},
        )

        # Schedule once
        now = timezone.now()
        run_scheduled_job(1)

        # Assert Basics
        sched_job = ScheduledJob.objects.get(id=1)
        initial_update = sched_job.lastModified
        self.assertEqual(
            sched_job.schedule_status, ScheduledJob.SchedJobStatusChoices.SCHEDULED
        )
        self.assertEqual(1, Job.objects.count())
        job1 = Job.objects.latest("id")
        self.assertEqual(job1.jobstatus, Job.StatusChoices.PENDING)

        dyn_time_t_str = job1.payload["payload"]["requiredArg"]
        dyn_time_dt = timezone.datetime.strptime(dyn_time_t_str, fmt)
        uspac_tz = pytz.timezone("US/Pacific")
        localized_dyn_time_dt = uspac_tz.localize(dyn_time_dt)
        utc_dyn_time_dt = localized_dyn_time_dt.astimezone(pytz.utc)
        exp_dyn_time_dt = now + timezone.timedelta(hours=hrs_sub)
        delta = timezone.timedelta(seconds=2)
        self.assertAlmostEqual(
            exp_dyn_time_dt,
            utc_dyn_time_dt,
            delta=delta,
            msg=f"Expected: {exp_dyn_time_dt}, Actual: {utc_dyn_time_dt}",
        )

        time.sleep(3)  ## long enough to catch > 2 second delta
        now = timezone.now()
        run_scheduled_job(1)

        # Make sure scheduled job object updated
        sched_job.refresh_from_db()
        this_update = sched_job.lastModified
        self.assertNotEqual(initial_update, this_update)
        self.assertEqual(
            sched_job.schedule_status, ScheduledJob.SchedJobStatusChoices.SCHEDULED
        )

        # Make sure new job was created
        self.assertEqual(2, Job.objects.count())
        job2 = Job.objects.latest("id")
        self.assertNotEqual(job1.id, job2.id)
        self.assertEqual(job2.jobstatus, Job.StatusChoices.PENDING)

        dyn_time_t_str = job2.payload["payload"]["requiredArg"]
        dyn_time_dt = timezone.datetime.strptime(dyn_time_t_str, fmt)
        uspac_tz = pytz.timezone("US/Pacific")
        localized_dyn_time_dt = uspac_tz.localize(dyn_time_dt)
        utc_dyn_time_dt = localized_dyn_time_dt.astimezone(pytz.utc)
        exp_dyn_time_dt = now + timezone.timedelta(hours=hrs_sub)
        delta = timezone.timedelta(seconds=2)
        self.assertAlmostEqual(
            exp_dyn_time_dt,
            utc_dyn_time_dt,
            delta=delta,
            msg=f"Expected: {exp_dyn_time_dt}, Actual: {utc_dyn_time_dt}",
        )

    def test_dynamic_exact(self):
        self.DEFAULT_SCHEMA["allow_repeat_schedules"] = True
        self.DEFAULT_SCHEMA["dynamic_keys"] = ["requiredArg"]
        self.DEFAULT_SCHEMA["properties"]["payload"]["properties"]["requiredArg"][
            "pattern"
        ] = DT_REGEX

        self.create_jobtype()
        self.create_jobschema()

        url = f"{self.job_sched_url}create/"
        r = self.client.get(url)
        form_url = r.json()["data"]["jobs"][self.DEFAULT_JOBTYPE][
            self.DEFAULT_SCHEMA_VERSION
        ]["url"]
        form_r = self.client.get(form_url)
        submit_url = form_r.json()["data"]["submit"]

        TOS_payload = {}
        TOS_payload["payload"] = {
            "__dynamic__requiredArg": {
                "selection": "Exact",
                "value": "202311151112",
            },
            "optionalArg": "hello",
        }

        self.jobsched_payload["payload"] = TOS_payload
        r = self.client.post(submit_url, self.jobsched_payload, format="json")

        self.assertEqual(
            r.status_code,
            status.HTTP_202_ACCEPTED,
            {"code": r.status_code, "exc": r.json()},
        )

        run_scheduled_job(1)

        job = ScheduledJob.objects.get(id=1)
        self.assertEqual(
            job.schedule_status, ScheduledJob.SchedJobStatusChoices.SCHEDULED
        )

    def test_periodic_task_actions(self):
        self.set_admin()
        self._create_defaults()

        self.assertEqual(PeriodicTask.objects.count(), 0)
        res = self.client.post(self.job_sched_url, self.jobsched_payload, format="json")
        self.assertEqual(PeriodicTask.objects.count(), 1)

        # Query params should be provided
        url = f"{self.periodic_task_url}actionables/"
        res = self.client.get(url)
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
        msg = "Query params (action, ids) should not be None"
        self.assertEqual(res.json()["errors"], msg)

        # enable task via actionable urls
        url = f"{self.periodic_task_url}actionables/?action=enable_tasks&ids=1"
        res = self.client.get(url)
        task = PeriodicTask.objects.get()
        self.assertTrue(task.enabled)
        self.assertEqual(res.json()["message"], "enable_tasks executed successfully")

        # disable task via actionable urls
        url = f"{self.periodic_task_url}actionables/?action=disable_tasks&ids=1"
        res = self.client.get(url)
        task.refresh_from_db()
        self.assertFalse(task.enabled)
        self.assertEqual(res.json()["message"], "disable_tasks executed successfully")

        # run task via actionable urls
        url = f"{self.periodic_task_url}actionables/?action=run_tasks&ids=1"
        res = self.client.get(url)
        task.refresh_from_db()
        self.assertEqual(task.scheduledjob.num_runs, 1)
        self.assertEqual(res.json()["message"], "1 task was successfully run")

        # delete task via actionable urls
        url = f"{self.periodic_task_url}actionables/?action=delete_tasks&ids=1"
        res = self.client.get(url)
        self.assertEqual(PeriodicTask.objects.count(), 0)
        self.assertEqual(res.json()["message"], "delete_tasks executed successfully")
