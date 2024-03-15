import os
from django.urls import reverse
from django.utils import timezone
from rest_framework import status

from common.serializers.reportserializer import Tags
from common.tests import HDSAPITestBase
from hds.urls import version

from .models import Candidate, Grip, GripReport
from .views import CandidateView
from .serializers.gripreportserializers import GripReportSerializer


class GripReportTestCase(HDSAPITestBase):
    def setUp(self):
        super().setUp()
        self.setup_basic()

    def test_basic(self):
        self.post_picksess_report()
        self.assertEqual(GripReport.objects.count(), 1)
        self.assertGreater(Candidate.objects.count(), 0)
        self.assertGreater(Grip.objects.count(), 0)

    def test_event(self):
        self.post_picksess_report()
        resp = self.client.get(self.griprep_det_url(1))
        event = resp.data["event"]

        self.assertTrue(GripReport.__name__ in event['tags'])
        url_ext = event["related_objects"][0]["url"]
        url = os.path.join(f"/{version}", url_ext[1:])
        r = self.client.get(url)
        self.assertEqual(r.status_code, status.HTTP_200_OK)

    def test_cand_extraction(self):
        self.post_picksess_report()
        num_exp_cands = len(self.picksess_data["data"]["cand"])

        self.assertEqual(Candidate.objects.count(), num_exp_cands)

        # make sure cand info extracted correctly
        exp_cand = self.picksess_data["data"]["cand"][0]
        cand = Candidate.objects.get(cand_id=exp_cand["cand_id"])

        self.assertEqual(cand.ripeness, exp_cand["ripeness"])
        self.assertEqual(cand.robot_id, exp_cand["robot_id"])
        self.assertEqual(cand.score, exp_cand["score"])
        self.assertDictEqual(cand.candidate_data, exp_cand)

    def test_cand_view(self):
        self.post_picksess_report()
        url = reverse("candidates-list")
        resp = self.client.get(url)
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(len(resp.json()["data"]["results"]), len(self.picksess_data["data"]["cand"]))

        id_ = resp.json()["data"]["results"][0]["id"]
        url = reverse("candidates-detail", args=[id_])
        resp = self.client.get(url)
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(resp.json()["data"]["id"], id_)

    def test_cand_filters(self):
        self.post_picksess_report()
        rep = GripReport.objects.first()
        url = reverse("candidates-list")

        # Robot ID filter
        resp = self.client.get(url, {"robot_ids": 4})
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(len(resp.json()["data"]["results"]), 3)

        resp = self.client.get(url, {"robot_ids": 2})
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(len(resp.json()["data"]["results"]), 0)

        # Start End Filter
        rep_time: timezone.datetime = rep.reportTime
        good_start = rep_time - timezone.timedelta(days=1)
        good_end = rep_time + timezone.timedelta(days=1)
        resp = self.client.get(url, {"start_time": good_start.strftime("%Y-%m-%dT%H:%M:%S%z"), "end_time": good_end.strftime("%Y-%m-%dT%H:%M:%S%z")})
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(len(resp.json()["data"]["results"]), 3)

        bad_start = rep_time + timezone.timedelta(days=2)
        resp = self.client.get(url, {"start_time": bad_start.strftime("%Y-%m-%dT%H:%M:%S%z")})
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(len(resp.json()["data"]["results"]), 0)

        # Harvester Filter
        resp = self.client.get(url, {"harv_ids": self.test_objects["harvester"].harv_id})
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(len(resp.json()["data"]["results"]), 3)

        resp = self.client.get(url, {"harv_ids": 8000})
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(len(resp.json()["data"]["results"]), 0)

        # Pick Session Filter
        ps_uuid = rep.pick_session_uuid
        resp = self.client.get(url, {"picksess": ps_uuid})
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(len(resp.json()["data"]["results"]), 3)

        resp = self.client.get(url, {"picksess": "bad_uuid"})
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(len(resp.json()["data"]["results"]), 0)

        # Event Filter
        event_uuid = rep.event_uuid
        resp = self.client.get(url, {"uuid": event_uuid})
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(len(resp.json()["data"]["results"]), 3)

        resp = self.client.get(url, {"uuid": "bad_uuid"})
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(len(resp.json()["data"]["results"]), 0)

    def test_cand_full(self):
        self.post_picksess_report()

        # Check normal get first
        url = reverse("candidates-list")
        resp = self.client.get(url)
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(len(resp.json()["data"]["results"]), len(self.picksess_data["data"]["cand"]))
        for c in resp.json()["data"]["results"]:
            self.assertNotIn("candidate_data", c)

        # Now check its there in the full response
        url = reverse("candidates-full")
        resp = self.client.get(url)
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(len(resp.json()["data"]["results"]), len(self.picksess_data["data"]["cand"]))
        
        for c in resp.json()["data"]["results"]:
            self.assertIn("bbox", c)
            self.assertIn("gpos", c)
            self.assertIn("pick_session", c)

    def test_cand_broken_extract(self):
        self.load_picksess_report()
        sample_cand = self.picksess_data["data"]["cand"][0]
        sample_grip = self.picksess_data["data"]["grip"][0]

        for _ in range(200):
            self.picksess_data["data"]["cand"].append(sample_cand)
            self.picksess_data["data"]["grip"].append(sample_grip)
        
        self.picksess_data["data"]["cand"].append({"broken": "cand"})
        with self.update_picksess_report(self.picksess_data):
            self.post_picksess_report()

        tags = GripReport.objects.first().tags.all()   
        tags = [t.name for t in tags]
        self.assertIn(Tags.INCOMPLETE.value, tags)
        self.assertIn(GripReportSerializer.ExtractTags.CAND_FAILED, tags)

        # Make sure we rolled back
        self.assertEqual(Candidate.objects.count(), 0)
        self.assertEqual(Grip.objects.count(), 0)


    def test_grip_extraction(self):
        self.post_picksess_report()
        num_exp_grips = len(self.picksess_data["data"]["grip"])

        self.assertEqual(Grip.objects.count(), num_exp_grips)

        # make sure grip info extracted correctly
        exp_grip = self.picksess_data["data"]["grip"][0]
        grip = Grip.objects.get(grip_start_ts=exp_grip["grip_start_ts"])

        self.assertEqual(grip.grip_end_ts, exp_grip["grip_end_ts"])
        self.assertEqual(grip.grip_start_ts, exp_grip["grip_start_ts"])
        self.assertEqual(grip.pick_result, exp_grip["pick_result"])
        self.assertEqual(grip.grip_result, exp_grip["grip_result"])
        self.assertEqual(grip.robot_id, exp_grip["robot_id"])
        self.assertDictEqual(grip.grip_data, exp_grip)
        self.assertTrue(grip.success)
        self.assertEqual(grip.grip_duration, exp_grip["grip_end_ts"] - exp_grip["grip_start_ts"])

        # make sure the right cand was linked
        cand_list = self.picksess_data["data"]["cand"]
        exp_cand = None
        for cand in cand_list:
            if cand["cand_id"] == exp_grip["cand_id"] and cand["robot_id"] == exp_grip["robot_id"]:
                exp_cand = cand
                break
        
        cand_obj = Candidate.objects.get(cand_id=exp_cand["cand_id"], robot_id=exp_cand["robot_id"])
        self.assertEqual(grip.candidate, cand_obj)

    def test_grip_view(self):
        self.post_picksess_report()
        url = reverse("grips-list")
        resp = self.client.get(url)
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(len(resp.json()["data"]["results"]), len(self.picksess_data["data"]["grip"]))

        id_ = resp.json()["data"]["results"][0]["id"]
        url = reverse("grips-detail", args=[id_])
        resp = self.client.get(url)
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(resp.json()["data"]["id"], id_)

    def test_grip_filters(self):
        self.post_picksess_report()
        rep = GripReport.objects.first()
        url = reverse("grips-list")

        # Robot ID filter
        resp = self.client.get(url, {"robot_ids": 4})
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(len(resp.json()["data"]["results"]), 2)

        resp = self.client.get(url, {"robot_ids": 2})
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(len(resp.json()["data"]["results"]), 0)

        # Start End Filter
        rep_time: timezone.datetime = rep.reportTime
        good_start = rep_time - timezone.timedelta(days=1)
        good_end = rep_time + timezone.timedelta(days=1)
        resp = self.client.get(url, {"start_time": good_start.strftime("%Y-%m-%dT%H:%M:%S%z"), "end_time": good_end.strftime("%Y-%m-%dT%H:%M:%S%z")})
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(len(resp.json()["data"]["results"]), 2)

        bad_start = rep_time + timezone.timedelta(days=2)
        resp = self.client.get(url, {"start_time": bad_start.strftime("%Y-%m-%dT%H:%M:%S%z")})
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(len(resp.json()["data"]["results"]), 0)

        # Harvester Filter
        resp = self.client.get(url, {"harv_ids": self.test_objects["harvester"].harv_id})
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(len(resp.json()["data"]["results"]), 2)

        resp = self.client.get(url, {"harv_ids": 8000})
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(len(resp.json()["data"]["results"]), 0)

        # Pick Session Filter
        ps_uuid = rep.pick_session_uuid
        resp = self.client.get(url, {"picksess": ps_uuid})
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(len(resp.json()["data"]["results"]), 2)

        resp = self.client.get(url, {"picksess": "bad_uuid"})
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(len(resp.json()["data"]["results"]), 0)

        # Event Filter
        event_uuid = rep.event_uuid
        resp = self.client.get(url, {"uuid": event_uuid})
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(len(resp.json()["data"]["results"]), 2)

        resp = self.client.get(url, {"uuid": "bad_uuid"})
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(len(resp.json()["data"]["results"]), 0)

        # Success Filter
        resp = self.client.get(url, {"success": True})
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(len(resp.json()["data"]["results"]), 1)
        succ_id = resp.json()["data"]["results"][0]["id"]

        resp = self.client.get(url, {"success": False})
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(len(resp.json()["data"]["results"]), 1)
        fail_id = resp.json()["data"]["results"][0]["id"]

        self.assertNotEqual(succ_id, fail_id)

    def test_grip_full(self):
        self.post_picksess_report()

        # Check normal get first
        url = reverse("grips-list")
        resp = self.client.get(url)
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(len(resp.json()["data"]["results"]), len(self.picksess_data["data"]["grip"]))
        for c in resp.json()["data"]["results"]:
            self.assertNotIn("grip_data", c)

        # Now check its there in the full response
        url = reverse("grips-full")
        resp = self.client.get(url)
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(len(resp.json()["data"]["results"]), len(self.picksess_data["data"]["grip"]))
        
        for c in resp.json()["data"]["results"]:
            self.assertIn("touchData", c)
            self.assertIn("acquireData", c)
            self.assertIn("pick_session", c)
    
    def test_grip_broken_extract(self):
        self.load_picksess_report()
        sample_cand = self.picksess_data["data"]["cand"][0]
        sample_grip = self.picksess_data["data"]["grip"][0]

        for _ in range(200):
            self.picksess_data["data"]["cand"].append(sample_cand)
            self.picksess_data["data"]["grip"].append(sample_grip)
        
        self.picksess_data["data"]["grip"].append({"broken": "grip"})
        with self.update_picksess_report(self.picksess_data):
            self.post_picksess_report()

        tags = GripReport.objects.first().tags.all()   
        tags = [t.name for t in tags]
        self.assertIn(Tags.INCOMPLETE.value, tags)
        self.assertIn(GripReportSerializer.ExtractTags.GRIP_FAILED, tags)

        # Make sure we rolled back
        self.assertNotEqual(Candidate.objects.count(), 0)  # We should have some cands
        self.assertEqual(Grip.objects.count(), 0)
    
    def test_data_cleared(self):
        self.post_picksess_report()
        rep = GripReport.objects.first()
        self.assertNotIn("cand", rep.report["data"])
        self.assertNotIn("grip", rep.report["data"])
