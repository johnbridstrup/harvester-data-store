import time
from django.urls import reverse
from rest_framework import status

from common.tests import HDSAPITestBase

from .models import HarvesterAssetReport


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
            "serial_number": serial_number,
            "version": version,
        }

    def create_report(self, *assets):
        return {
            "timestamp": time.time(),
            "serial_number": self.test_objects["harvester"].harv_id,
            "type": "asset-report",
            "data": {"assets": list(assets)},
        }

    def test_basic(self):
        r = self.client.post(self.url, self.base_report, format='json')
        self.assertEqual(r.status_code, status.HTTP_201_CREATED)
