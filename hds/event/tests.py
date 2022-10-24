from common.tests import HDSAPITestBase
from errorreport.models import ErrorReport
from event.models import Event

from django.urls import reverse


class EventApiTestCase(HDSAPITestBase):
    def setUp(self):
        super().setUp()
        self._setup_basic()
        self.update_user_permissions_all(ErrorReport)
        self.update_user_permissions_all(Event)
        self.event_url = reverse("event-list")

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
        
