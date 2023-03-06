from django.test.client import RequestFactory
from django.urls import reverse
from rest_framework import status

from common.utils import build_api_url
from harvjobs.tests.HarvJobApiTestBase import HarvJobApiTestBase


class JobSchedulerTestCase(HarvJobApiTestBase):
    def setUp(self):
        super().setUp()
        self.factory = RequestFactory()
        self.url = reverse("jobscheduler-list")

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
