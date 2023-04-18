import os
from django.urls import reverse
from rest_framework import status

from common.tests import HDSAPITestBase
from event.models import PickSession
from hds.urls import version

from .models import GripReport


class GripReportTestCase(HDSAPITestBase):
    def setUp(self):
        super().setUp()
        self.test_objects = self._setup_basic()
        self.url = reverse("gripreports-list")

    def test_basic(self):
        self._post_picksess_report()
        self.assertEqual(GripReport.objects.count(), 1)

    def test_event(self):
        resp = self._post_picksess_report()
        event = resp["data"]["event"]
        
        self.assertTrue(GripReport.__name__ in event['tags'])
        url_ext = event["related_objects"][0]["url"]
        url = os.path.join(f"/{version}", url_ext[1:])
        r = self.client.get(url)
        self.assertEqual(r.status_code, status.HTTP_200_OK)
