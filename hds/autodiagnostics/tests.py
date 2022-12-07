from django.urls import reverse
from rest_framework import status

from common.tests import HDSAPITestBase

from .models import AutodiagnosticsReport


class AutodiagnosticsApiTestCase(HDSAPITestBase):
    def setUp(self):
        super().setUp()
        self.test_objects = self._setup_basic()
        self.update_user_permissions_all(AutodiagnosticsReport)
        self.url = reverse("autodiagnostics-list")
    
    def test_basic(self):
        self._post_autodiag_report()

    def test_get_ad_report(self):
        self._post_autodiag_report()

        r = self.client.get(self.url)
        self.assertEqual(r.status_code, status.HTTP_200_OK)

        data = r.json()["data"]
        self.assertEqual(data["count"], 1)
        self.assertEqual(data["results"][0]["result"], True)

    def test_get_with_params(self):
        self._post_autodiag_report()

        r_all = self.client.get(self.url)
        self.assertEqual(r_all.json()["data"]["count"], 1)

        r_harv11 = self.client.get(f"{self.url}?harvester__harv_id=11")
        self.assertEqual(r_harv11.json()["data"]["count"], 1)

        r_harv12 = self.client.get(f"{self.url}?harvester__harv_id=12")
        self.assertEqual(r_harv12.json()["data"]["count"], 0)

        r_sn1297 = self.client.get(f"{self.url}?gripper_sn=1297")
        self.assertEqual(r_sn1297.json()["data"]["count"], 1)

        r_sn1299 = self.client.get(f"{self.url}?gripper_sn=1299")
        self.assertEqual(r_sn1299.json()["data"]["count"], 0)
        