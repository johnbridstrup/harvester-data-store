import os
from rest_framework import status

from common.tests import HDSAPITestBase
from hds.urls import version

from .models import Candidate, Grip, GripReport


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
