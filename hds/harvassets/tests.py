import time
from django.urls import reverse
from rest_framework import status

from common.tests import HDSAPITestBase

from .models import HarvesterAssetReport, HarvesterAsset, HarvesterAssetType
from .tasks import compile_asset_report


class HarvesterAssetsTestCase(HDSAPITestBase):
    def setUp(self):
        super().setUp()
        self.test_objects = self._setup_basic()
        self.url = reverse("harvassetreport-list")
        self.asset_url = reverse("harvassets-list")
        self.base_report = self.create_report(self.asset())

    def asset(self, asset="test", index=1, serial_number=33, version=None):
        return {
            "asset": asset,
            "index": index,
            "asset-tag": serial_number,
            "version": version,
        }

    def create_report(self, *assets):
        return {
            "timestamp": time.time(),
            "serial_number": self.test_objects["harvester"].harv_id,
            "type": "asset-report",
            "data": list(assets),
        }

    def test_basic(self):
        r = self.client.post(self.url, self.base_report, format='json')
        self.assertEqual(r.status_code, status.HTTP_201_CREATED)

    def test_asset_extraction_basic(self):
        self.client.post(self.url, self.base_report, format='json')
        self.assertEqual(HarvesterAssetType.objects.count(), 1)
        self.assertEqual(HarvesterAsset.objects.count(), 1)

        # We delete the report after successful extraction
        self.assertEqual(HarvesterAssetReport.objects.count(), 0)

    def test_extraction_multi_sn(self):
        report = self.create_report(
            *[self.asset(serial_number=i) for i in range(5)]
        )

        self.client.post(self.url, report, format='json')
        self.assertEqual(HarvesterAssetType.objects.count(), 1)
        self.assertEqual(HarvesterAsset.objects.count(), 5)

    def test_extraction_multi_type(self):
        types = ['type1', 'type2', 'type3']
        report = self.create_report(
            *[self.asset(asset=i) for i in types]
        )

        self.client.post(self.url, report, format='json')
        self.assertEqual(HarvesterAssetType.objects.count(), 3)
        self.assertEqual(HarvesterAsset.objects.count(), 3)

    def test_replace_asset(self):
        self.client.post(self.url, self.base_report, format='json')
        self.assertTrue(self.test_objects['harvester'].has_asset("test", 33))

        report = self.create_report(self.asset(serial_number=31))
        self.client.post(self.url, report, format='json')

        self.assertEqual(HarvesterAssetType.objects.count(), 1)
        self.assertEqual(HarvesterAsset.objects.count(), 2)

        self.assertFalse(self.test_objects['harvester'].has_asset("test", 33))
        self.assertTrue(self.test_objects['harvester'].has_asset("test", 31))

    def test_sample_report(self):
        self._load_asset_report()
        r = self.client.post(self.url, self.asset_data, format='json')
        self.assertEqual(r.status_code, status.HTTP_201_CREATED)

        self.assertEqual(HarvesterAsset.objects.count(), len(self.asset_data["data"]))

        exp_asset_types = len(set([i["asset"] for i in self.asset_data["data"]]))
        self.assertEqual(HarvesterAssetType.objects.count(), exp_asset_types)


    def test_get_assets_basic(self):
        r = self.client.get(self.asset_url)
        self.assertEqual(r.status_code, status.HTTP_200_OK)

    def test_get_assets_params(self):
        types = ["type1", "type1", "type2"]
        report = self.create_report(
            *[self.asset(asset=i, serial_number=j, index=j) for i, j in zip(types, range(1,4))]
        )
        self.client.post(self.url, report, format='json')

        r1 = self.client.get(f"{self.asset_url}?harvester__harv_id=11")
        self.assertEqual(r1.json()["data"]["count"], 3)

        new_report = self.create_report(
            *[self.asset(asset=i, serial_number=j+3, index=j) for i, j in zip(types, range(1,4))]
        )
        self.client.post(self.url, new_report, format='json')

        r1 = self.client.get(f"{self.asset_url}?harvester__harv_id=11")
        self.assertEqual(r1.json()["data"]["count"], 3)

        r2 = self.client.get(f"{self.asset_url}?asset__name=type1")
        self.assertEqual(r2.json()["data"]["count"], 4)

    def test_get_harvester_assets(self):
        url = reverse("harvester-detail", args=[1])
        self.client.post(self.url, self.base_report, format='json')

        r = self.client.get(url)
        self.assertTrue("assets" in r.json()["data"])

        assets_url = f"{url}{r.json()['data']['assets']}"
        r2 = self.client.get(assets_url)
        data = r2.json()["data"]
        self.assertEqual(r2.status_code, status.HTTP_200_OK)
        self.assertEqual(len(data), 1)

        asset = data[0]
        self.assertEqual(asset["asset"]["name"], "test")
        self.assertEqual(asset["serial_number"], "33")

    def test_compile_report(self):
        self._load_asset_report()
        self.client.post(self.url, self.asset_data, format='json')

        report = compile_asset_report()

        harv_key = f"Harvester {self.test_objects['harvester'].harv_id}"
        self.assertIn(harv_key, report)
        for asset in self.asset_data["data"]:
            self.assertIn(asset["asset"], report[harv_key])
            self.assertTrue([str(asset["asset-tag"]) == d["serial number"] for d in report[harv_key][asset["asset"]]])
            self.assertTrue([int(asset["index"]) == d["index"] for d in report[harv_key][asset["asset"]]])
