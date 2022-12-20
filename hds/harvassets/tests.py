import time
from django.urls import reverse
from rest_framework import status

from common.tests import HDSAPITestBase

from .models import HarvesterAssetReport, HarvesterAsset, HarvesterAssetType


class HarvesterAssetsTestCase(HDSAPITestBase):
    def setUp(self):
        super().setUp()
        self.test_objects = self._setup_basic()
        self.url = reverse("harvassetreport-list")
        self.update_user_permissions_all(HarvesterAssetReport)
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

