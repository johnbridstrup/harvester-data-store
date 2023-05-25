import os
from rest_framework import status

from common.tests import HDSAPITestBase
from hds.urls import version

from .models import GripReport


class GripReportTestCase(HDSAPITestBase):
    def setUp(self):
        super().setUp()
        self.setup_basic()

    def test_basic(self):
        self.post_picksess_report()
        self.assertEqual(GripReport.objects.count(), 1)

    def test_event(self):
        self.post_picksess_report()
        resp = self.client.get(self.griprep_det_url(1))
        event = resp.data["event"]

        self.assertTrue(GripReport.__name__ in event['tags'])
        url_ext = event["related_objects"][0]["url"]
        url = os.path.join(f"/{version}", url_ext[1:])
        r = self.client.get(url)
        self.assertEqual(r.status_code, status.HTTP_200_OK)
