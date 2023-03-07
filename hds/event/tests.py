from common.tests import HDSAPITestBase
from event.models import Event, PickSession
from errorreport.models import ErrorReport
from s3file.models import S3File

from rest_framework import status
from django.urls import reverse


class TaggedUUIDModelTestBase(HDSAPITestBase):
    def setUp(self):
        super().setUp()
        self._setup_basic()
        self.update_user_permissions_all(ErrorReport)
        self.update_user_permissions_all(Event)
        self.update_user_permissions_all(S3File)
        self.event_url = reverse("event-list")
        self.picksess_url = reverse("picksession-list")
        self.tags_endpoint = f"{self.event_url}tags/"


class EventApiTestCase(TaggedUUIDModelTestBase):
    def test_get_by_UUID(self):
        self._post_error_report()
        self.data['uuid'] = Event.generate_uuid()
        self._post_error_report(load=False)
        self.data['uuid'] = Event.generate_uuid()
        data = self._post_error_report(load=False)
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


class PickSessionApiTestCase(TaggedUUIDModelTestBase):
    def test_get_by_UUID(self):
        self._post_autodiag_report()
        self.ad_data["uuid"] = Event.generate_uuid()
        self._post_autodiag_report(load=False)
        self.ad_data["uuid"] = Event.generate_uuid()
        data = self._post_autodiag_report(load=False)

        picksess_uuid = data["data"]["pick_session"]["UUID"]

        # 3 total events
        all_resp = self.client.get(self.event_url)
        self.assertEqual(all_resp.json()["data"]["count"], 3)

        # 1 pick session
        resp = self.client.get(self.picksess_url + f"?UUID={picksess_uuid}")
        self.assertEqual(resp.json()["data"]["count"], 1)


class EventPicksessIntegrationTestCase(TaggedUUIDModelTestBase):
    def test_multi_report(self):
        # The test data have the same pick_session_uuid
        self._post_error_report()
        self._post_autodiag_report()

        self.assertEqual(Event.objects.count(), 2)
        self.assertEqual(PickSession.objects.count(), 1)
        erreport_url = reverse("errorreport-detail", args=[1])
        autodrep_url = reverse("autodiagnostics-detail", args=[1])

        erreport_resp = self.client.get(erreport_url)
        autodiag_resp = self.client.get(autodrep_url)

        err_event = erreport_resp.json()['data']['event']
        aut_event = autodiag_resp.json()['data']['event']
        err_sess = erreport_resp.json()['data']['pick_session']
        aut_sess = autodiag_resp.json()['data']['pick_session']

        # Events are different, session is the same
        self.assertNotEqual(err_event, aut_event)
        self.assertEqual(err_sess, aut_sess)
