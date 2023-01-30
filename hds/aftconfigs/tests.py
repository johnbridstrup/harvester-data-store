from django.urls import reverse
from rest_framework import status

from common.tests import HDSAPITestBase

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
