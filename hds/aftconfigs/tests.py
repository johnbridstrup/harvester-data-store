from django.urls import reverse
from rest_framework import status

from common.tests import HDSAPITestBase
from hds.roles import RoleChoices

from .models import ConfigReport


class ConfigReportTestCase(HDSAPITestBase):
    def setUp(self):
        super().setUp()
        self.test_objects = self._setup_basic()
        self.url = reverse("configreports-list")
        self._load_config_data()

    def test_basic(self):
        r = self.client.post(self.url, data=self.conf_data, format='json')
        self.assertEqual(r.status_code, status.HTTP_201_CREATED)
        self.assertEqual(ConfigReport.objects.count(), 1)

    def test_harvester_latest(self):
        self.set_user_role(RoleChoices.SQS)
        ts1 = self.conf_data["timestamp"]
        self.client.post(self.url, data=self.conf_data, format='json')

        self.set_user_role(RoleChoices.SUPPORT)
        r = self.client.get(f"{self.api_base_url}/harvesters/1/config/")
        self.assertEqual(r.json()["data"]["report"]["timestamp"], ts1)

        self.set_user_role(RoleChoices.SQS)
        ts2 = self.conf_data["timestamp"] + 100
        self.conf_data["timestamp"] = ts2
        self.client.post(self.url, data=self.conf_data, format='json')

        self.set_user_role(RoleChoices.SUPPORT)
        r = self.client.get(f"{self.api_base_url}/harvesters/1/config/")
        self.assertEqual(r.json()["data"]["report"]["timestamp"], ts2)

        
