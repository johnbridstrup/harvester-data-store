import time
from django.test.client import RequestFactory
from django.utils import timezone
from django.utils.timezone import datetime, timedelta
from django.utils.http import urlencode
from rest_framework import status

from common.reports import DTimeFormatter
from common.tests import HDSAPITestBase
from event.models import Event, PickSession
from event.serializers import PickSessionDetailSerializer
from errorreport.models import ErrorReport
from s3file.models import S3File


class TaggedUUIDModelTestBase(HDSAPITestBase):
    def setUp(self):
        super().setUp()
        self.setup_basic()
        self.tags_endpoint = f"{self.event_url}tags/"
        self.factory = RequestFactory()


class EventApiTestCase(TaggedUUIDModelTestBase):
    def test_get_by_UUID(self):
        self.post_error_report()
        self.data["uuid"] = Event.generate_uuid()
        self.post_error_report(load=False)
        self.data["uuid"] = Event.generate_uuid()
        data = self.post_error_report(load=False)
        resp = self.client.get(self.error_det_url(data["data"]["id"]))
        UUID = resp.data["event"]["UUID"]

        # 3 total events
        all_resp = self.client.get(self.event_url)
        self.assertEqual(all_resp.json()["data"]["count"], 3)

        # 1 event with requested UUID
        resp = self.client.get(self.event_url + f"?UUID={UUID}")
        self.assertEqual(resp.json()["data"]["count"], 1)

    def test_event_tags(self):
        data = self.post_error_report()
        resp = self.client.get(self.error_det_url(data["data"]["id"]))
        UUID = resp.data["event"]["UUID"]
        key = f"test_{UUID}"
        r = self.create_s3file(key, self.s3file_url, has_uuid=True)

        r = self.client.get(self.tags_endpoint)
        self.assertEqual(r.status_code, status.HTTP_200_OK)

        data = r.json()["data"]
        expect = [self.filetype, ErrorReport.__name__]

        for tag in expect:
            self.assertIn(tag, data["tags"])

    def test_filter_by_tags(self):
        data = self.post_error_report()
        resp = self.client.get(self.error_det_url(data["data"]["id"]))
        UUID1 = resp.data["event"]["UUID"]
        UUID2 = Event.generate_uuid()
        UUID3 = Event.generate_uuid()
        ftype1 = f"test"
        ftype2 = f"anothertest"

        self.create_s3file(f"{ftype1}_{UUID1}", self.s3file_url, has_uuid=True)
        self.create_s3file(f"{ftype2}_{UUID2}", self.s3file_url, has_uuid=True)

        self.data["uuid"] = UUID3
        self.post_error_report(load=False)

        all_r = self.client.get(self.event_url)
        self.assertEqual(all_r.json()["data"]["count"], 3)

        # There should be 4 tags and 3 events.
        # Event 1: ErrorReport, S3File and test tags
        # Event 2: S3File and anothertest tags
        # Event 3: ErrorReport tag

        case1 = [ErrorReport.__name__]  # match event 1 and 3
        params1 = urlencode({"tags": ",".join(case1)})
        c1_r = self.client.get(f"{self.event_url}?{params1}")
        self.assertEqual(c1_r.json()["data"]["count"], 2)
        exp_uuids = [UUID1, UUID3]
        for event in c1_r.json()["data"]["results"]:
            self.assertIn(event["UUID"], exp_uuids)
            exp_uuids.remove(event["UUID"])

        case2 = [S3File.__name__]  # match event 1 and 2
        params2 = urlencode({"tags": ",".join(case2)})
        c2_r = self.client.get(f"{self.event_url}?{params2}")
        self.assertEqual(c2_r.json()["data"]["count"], 2)
        exp_uuids = [UUID1, UUID2]
        for event in c2_r.json()["data"]["results"]:
            self.assertIn(event["UUID"], exp_uuids)
            exp_uuids.remove(event["UUID"])

        case3 = [ftype1, ErrorReport.__name__]  # match only event 1
        params3 = urlencode({"tags": ",".join(case3)})
        c3_r = self.client.get(f"{self.event_url}?{params3}")
        self.assertEqual(c3_r.json()["data"]["count"], 1)
        exp_uuids = [UUID1]
        for event in c3_r.json()["data"]["results"]:
            self.assertIn(event["UUID"], exp_uuids)
            exp_uuids.remove(event["UUID"])

        case4 = [ftype2, ErrorReport.__name__]  # match no events
        params4 = urlencode({"tags": ",".join(case4)})
        c4_r = self.client.get(f"{self.event_url}?{params4}")
        self.assertEqual(c4_r.json()["data"]["count"], 0)


class PickSessionApiTestCase(TaggedUUIDModelTestBase):
    def test_get_by_UUID(self):
        self.post_autodiag_report()
        self.ad_data["uuid"] = Event.generate_uuid()
        self.post_autodiag_report(load=False)
        self.ad_data["uuid"] = Event.generate_uuid()
        data = self.post_autodiag_report(load=False)
        resp = self.client.get(self.ad_det_url(data["data"]["id"]))

        picksess_uuid = resp.data["pick_session"]["UUID"]

        # 3 total events
        all_resp = self.client.get(self.event_url)
        self.assertEqual(all_resp.json()["data"]["count"], 3)

        # 1 pick session
        resp = self.client.get(self.picksess_url + f"?UUID={picksess_uuid}")
        self.assertEqual(resp.json()["data"]["count"], 1)

    def test_filter_params(self):
        t0 = time.time()
        ts = [t0 + i * 100 for i in range(4)]  # Four start times
        fruit = self.test_objects["fruit"]
        harvs = [
            self.create_harvester_object(
                harv_id=i + 1000,
                location=self.create_location_object(ranch=f"ranch_{i}"),
                name=f"new_harv_{i}",
                fruit=fruit,
            )
            for i in range(1, 3)
        ] * 2  # two harvesters

        for t, harv in zip(ts, harvs):
            UUID = PickSession.generate_uuid()
            dt = DTimeFormatter.from_timestamp(t)
            PickSession.objects.create(
                UUID=UUID,
                start_time=dt,
                harvester=harv,
                location=harv.location,
                creator=self.user,
            )

        # Filter by harvester
        resp = self.client.get(
            self.picksess_url + f"?harv_ids={harvs[0].harv_id}"
        )
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(
            resp.json()["data"]["count"], 2
        )  # Two for each harvester

        # Filter by location
        resp = self.client.get(
            self.picksess_url + f"?locations={harvs[0].location.ranch}"
        )
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(
            resp.json()["data"]["count"], 2
        )  # Two for each harvester

        # Filter by start and end time
        start_str = timezone.datetime.fromtimestamp(ts[0] + 10)
        resp = self.client.get(
            self.picksess_url + f"?start_time={start_str}&tz=utc"
        )
        self.assertEqual(resp.json()["data"]["count"], 3)

        end_str = timezone.datetime.fromtimestamp(ts[-1] - 10)
        resp = self.client.get(
            self.picksess_url + f"?end_time={end_str}&tz=utc"
        )
        self.assertEqual(resp.json()["data"]["count"], 3)

        resp = self.client.get(
            self.picksess_url
            + f"?start_time={start_str}&end_time={end_str}&tz=utc"
        )
        self.assertEqual(resp.json()["data"]["count"], 2)


class EventPicksessIntegrationTestCase(TaggedUUIDModelTestBase):
    def test_multi_report(self):
        # The test data have the same pick_session_uuid
        self.post_error_report()
        self.post_autodiag_report()

        self.assertEqual(Event.objects.count(), 2)
        self.assertEqual(PickSession.objects.count(), 1)
        erreport_url = self.error_det_url(1)
        autodrep_url = self.ad_det_url(1)

        erreport_resp = self.client.get(erreport_url)
        autodiag_resp = self.client.get(autodrep_url)

        err_event = erreport_resp.json()["data"]["event"]
        aut_event = autodiag_resp.json()["data"]["event"]
        err_sess = erreport_resp.json()["data"]["pick_session"]
        aut_sess = autodiag_resp.json()["data"]["pick_session"]

        # Events are different, session is the same
        self.assertNotEqual(err_event, aut_event)
        self.assertEqual(err_sess, aut_sess)

    def test_picksess_meta(self):
        self.post_autodiag_report()
        self.post_picksess_report()

        start_time = DTimeFormatter.str_from_timestamp(
            self.picksess_data["pick_session_start_time"]
        )
        start_dt = DTimeFormatter.from_timestamp(
            self.picksess_data["pick_session_start_time"]
        )
        end_dt = DTimeFormatter.from_timestamp(self.picksess_data["timestamp"])

        picksess = PickSession.objects.get()

        req = self.factory.get(self.picksess_url)
        psdata = PickSessionDetailSerializer(
            instance=picksess, context={"request": req}
        ).data

        # From autodiag report
        self.assertEqual(
            self.test_objects["harvester"].harv_id,
            psdata["harvester"]["harv_id"],
        )
        self.assertEqual(
            self.test_objects["location"].ranch, psdata["location"]["ranch"]
        )

        # From picksess report
        self.assertEqual(start_time, psdata["start_time"])
        duration_exp = end_dt - start_dt
        dur_dt = datetime.strptime(psdata["session_length"], "%H:%M:%S.%f")
        duration = timedelta(
            hours=dur_dt.hour,
            minutes=dur_dt.minute,
            seconds=dur_dt.second,
            microseconds=dur_dt.microsecond,
        )
        self.assertEqual(duration, duration_exp)
