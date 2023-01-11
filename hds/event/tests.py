from common.tests import HDSAPITestBase
from event.models import Event
from errorreport.models import ErrorReport
from s3file.models import S3File

from rest_framework import status
from django.urls import reverse
class EventApiTestCase(HDSAPITestBase):
    def setUp(self):
        super().setUp()
        self._setup_basic()
        self.update_user_permissions_all(ErrorReport)
        self.update_user_permissions_all(Event)
        self.update_user_permissions_all(S3File)
        self.event_url = reverse("event-list")
        self.tags_endpoint = f"{self.event_url}tags/"

    def test_get_by_UUID(self):
        self._post_error_report()
        self._post_error_report()
        data = self._post_error_report()
        UUID = data["data"]["event"]["UUID"]

        # 3 total events
        all_resp = self.client.get(self.event_url)
        self.assertEqual(all_resp.json()["data"]["count"], 3)

        # 1 event with requested UUID
        resp = self.client.get(self.event_url + f"?UUID={UUID}")
        self.assertEqual(resp.json()["data"]["count"], 1)

    def test_event_tags(self):
        data = self._post_error_report()
        UUID = data["data"]["event"]["UUID"]
        key = f"test_{UUID}"
        r=self.create_s3file(key, has_uuid=True)

        r = self.client.get(self.tags_endpoint)
        self.assertEqual(r.status_code, status.HTTP_200_OK)
        
        data = r.json()["data"]
        expect = [self.filetype, ErrorReport.__name__]

        for tag in expect:
            self.assertIn(tag, data["tags"])
        
