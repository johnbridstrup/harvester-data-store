"""Test HarvesterSwInfo APIs"""

import time
from rest_framework import status

from common.tests import HDSAPITestBase
from common.reports import DTimeFormatter

from ..models import HarvesterSwInfo


class HarvesterSWInfoTest(HDSAPITestBase):
    def test_create_harvesterswinfo(self):
        self.setup_basic()
        self.load_config_data()
        res = self.client.post(
            self.harv_swinfo_url, self.conf_data, format="json"
        )
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertEqual(HarvesterSwInfo.objects.count(), 1)
        self.assertEqual(
            HarvesterSwInfo.objects.get().githash,
            self.conf_data["version_info"]["githash"],
        )
        self.assertEqual(
            HarvesterSwInfo.objects.get().dirty,
            self.conf_data["version_info"]["dirty"],
        )
        self.assertEqual(
            HarvesterSwInfo.objects.get().branchname,
            self.conf_data["version_info"]["branchname"],
        )
        self.assertEqual(
            HarvesterSwInfo.objects.get().deployer,
            self.conf_data["version_info"]["deployer"],
        )

    def test_update_harvesterswinfo(self):
        self.setup_basic()
        self.load_config_data()
        res = self.client.post(
            self.harv_swinfo_url, self.conf_data, format="json"
        )
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.conf_data["version_info"]["githash"] = "d88f2c4ac269b193f6a3"
        res = self.client.patch(
            self.harv_swinfo_det_url(res.json()["data"]["id"]),
            self.conf_data,
            format="json",
        )
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(
            res.json()["data"]["githash"],
            self.conf_data["version_info"]["githash"],
        )

    def test_get_harvesterswinfo(self):
        self.setup_basic()
        self.load_config_data()
        res = self.client.post(
            self.harv_swinfo_url, self.conf_data, format="json"
        )
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        res = self.client.get(
            self.harv_swinfo_det_url(res.json()["data"]["id"])
        )
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(
            res.json()["data"]["githash"],
            self.conf_data["version_info"]["githash"],
        )
        self.assertEqual(
            res.json()["data"]["deployer"],
            self.conf_data["version_info"]["deployer"],
        )
        self.assertEqual(
            res.json()["data"]["deployed_ts"],
            DTimeFormatter.str_from_timestamp(
                self.conf_data["version_info"]["deployed_ts"]
            ),
        )
        self.assertEqual(
            res.json()["data"]["branchname"],
            self.conf_data["version_info"]["branchname"],
        )
        self.assertEqual(
            res.json()["data"]["dirty"], self.conf_data["version_info"]["dirty"]
        )

    def test_delete_harvesterswinfo(self):
        self.setup_basic()
        self.load_config_data()
        res = self.client.post(
            self.harv_swinfo_url, self.conf_data, format="json"
        )
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        res = self.client.delete(
            self.harv_swinfo_det_url(res.json()["data"]["id"])
        )
        self.assertEqual(res.status_code, status.HTTP_204_NO_CONTENT)
        with self.assertRaises(HarvesterSwInfo.DoesNotExist):
            HarvesterSwInfo.objects.get()

    def test_filter_harvesterswinfo(self):
        self.setup_basic()
        self.load_config_data()
        res = self.client.post(
            self.harv_swinfo_url, self.conf_data, format="json"
        )
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.conf_data["version_info"]["deployed_ts"] = time.time()
        res = self.client.post(
            self.harv_swinfo_url, self.conf_data, format="json"
        )
        self.assertEqual(HarvesterSwInfo.objects.count(), 2)
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        url = f"{self.harv_swinfo_url}?harv_id=11&start_time=20240625000000&end_time=20240627000000"
        res = self.client.get(url)
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(len(res.json()["data"]["results"]), 1)
