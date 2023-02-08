from django.urls import reverse
from rest_framework import status

from common.tests import HDSAPITestBase
from event.models import Event, PickSession
from harvassets.models import HarvesterAssetType, HarvesterAsset

from .models import AutodiagnosticsReport, AutodiagnosticsRun
from .views import MAGIC_GRIPPER_MSG


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

        r_sn1298 = self.client.get(f"{self.url}?gripper_sn=1298")
        self.assertEqual(r_sn1298.json()["data"]["count"], 1)

        r_sn1299 = self.client.get(f"{self.url}?gripper_sn=1299")
        self.assertEqual(r_sn1299.json()["data"]["count"], 0)

    def test_magic_gripper(self):
        self._load_autodiag_report()
        self.ad_data['data']['serial_no'] = 1297
        r_json = self._post_autodiag_report(load=False, resp_status=status.HTTP_200_OK)
        self.assertEqual(r_json['data'], MAGIC_GRIPPER_MSG)

        r = self.client.get(self.url)
        data = r.json()["data"]
        self.assertEqual(data["count"], 0)

    def test_event_and_picksess_created(self):
        self._post_autodiag_report()
        self.assertEqual(Event.objects.count(), 1)
        self.assertEqual(PickSession.objects.count(), 1)
    def test_extract_basic(self):
        self._post_autodiag_report()
        self.assertEqual(AutodiagnosticsRun.objects.count(), 1)
        self.assertEqual(HarvesterAssetType.objects.count(), 1)
        self.assertEqual(HarvesterAsset.objects.count(), 1)

    def test_extract_values(self):
        self._post_autodiag_report()
        report = AutodiagnosticsReport.objects.get()
        run = AutodiagnosticsRun.objects.get()
        gripper = run.gripper

        self.assertEqual(report, run.report)
        self.assertEqual(int(gripper.serial_number), int(self.ad_data['data']['serial_no']))
        self.assertEqual(self.ad_data['data']['min_vac'], run.min_vac)
        self.assertDictEqual(run.sensors, self.ad_data['data']['sensors'])

        self.assertNotEqual(self.ad_data['data'], report.report['data'])
        self.assertDictContainsSubset(report.report['data'], self.ad_data['data'])
        