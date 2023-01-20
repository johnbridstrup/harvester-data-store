from django.urls import reverse

from common.tests import HDSAPITestBase

from .models import GripReport


class GripReportTestCase(HDSAPITestBase):
    def setUp(self):
        super().setUp()
        self.test_objects = self._setup_basic()
        self.url = reverse("gripreports-list")

    def test_basic(self):
        self.client.post(self.url, data=self.test_objects["dummy_report"], format='json')
        self.assertEqual(GripReport.objects.count(), 1)
