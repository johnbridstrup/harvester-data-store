import json
import itertools
import logging
import os
import pytest
import time
import uuid
import warnings
from parameterized import parameterized
from requests.status_codes import codes

from test_utils.Endpoints import Endpoints
from test_utils.exceptions import BeatboxTestError
from test_utils.TestBase import S3BaseTestCase


FRUITS = ["strawberry"]
PICKSESS_REPORTS = ["errorreport"]


class TestPicksessionReports(S3BaseTestCase):
    TEST_DATA_PATH = os.path.join(os.path.abspath(os.path.dirname(__file__)), "test_data")
    REPORT_FILEPATH_FMT = "{}_{}.json"
    MAX_RETRIES = 30
    RETRY_DELAY = 2  # Seconds

    def setUp(self):
        S3BaseTestCase.setUp(self)
        self.logger = logging.getLogger(__name__)

    # TESTS
    @parameterized.expand(list(itertools.product(FRUITS, PICKSESS_REPORTS)))
    def test_picksession_reports(self, fruit, report_type):
        self.logger.debug(f"{fruit} {report_type} pipeline started.")
        # Get beatbox harvester
        harv_id = self.get_beatbox_harv_id(fruit)

        # Generate event and picksession uuids
        ev_uuid = self._gen_uuid()
        ps_uuid = self._gen_uuid()

        # Check that these dont already exist
        # Apparently the odds of this are the same as being hit by a meteorite
        # and only if creating 10^13 UUIDs per year, but still...
        MAX_EXIST_RETRIES = 1
        num_retries = 0
        while self._ev_exists(ev_uuid):
            ev_uuid = self._gen_uuid()
            num_retries += 1
            if num_retries > MAX_EXIST_RETRIES:
                raise BeatboxTestError(f"Event UUID retries exceeds max: {num_retries}")
        
        num_retries = 0
        while self._ps_exists(ps_uuid):
            ps_uuid = self._gen_uuid()
            num_retries += 1
            if num_retries > MAX_EXIST_RETRIES:
                raise BeatboxTestError(f"Picksession UUID retries exceeds max: {num_retries}")

        # Upload report
        report = self._load_upload_picksess_report(fruit, report_type, harv_id, ev_uuid, ps_uuid)

        # Get event and picksess
        # We track retries through retrieving both ev and ps since they should happen at the same time.
        retries = 0
        ev_exists = self._ev_exists(ev_uuid)  
        while not ev_exists:
            retries += 1
            if retries > self.MAX_RETRIES:
                assert False, f"Event doesn't exist after {self.MAX_RETRIES * self.RETRY_DELAY} seconds"
            time.sleep(self.RETRY_DELAY)
            ev_exists = self._ev_exists(ev_uuid)
        
        ev_resp = self._get_event(ev_uuid)
        self.assertOk(ev_resp)
        num_evs = ev_resp.json()["data"]["count"]
        self.assertEqual(num_evs, 1, f"Expected 1 event, found {num_evs}")

        ps_exists = self._ps_exists(ps_uuid)
        while not ps_exists:
            retries += 1
            if retries > self.MAX_RETRIES:
                assert False, f"Picksession doesn't exist after {self.MAX_RETRIES * self.RETRY_DELAY} seconds"
            time.sleep(self.RETRY_DELAY)
            ps_exists = self._ps_exists(ps_uuid)
        
        ps_resp = self._get_picksess(ps_uuid)
        self.assertOk(ps_resp)
        num_ps = ps_resp.json()["data"]["count"]
        self.assertEqual(num_ps, 1, f"Expected 1 pick session, found {num_ps}")

        # Check report specific behavior
        try:
            extract_behavior = getattr(self, f"assert_{report_type}_behavior")
            extrctn_errs = extract_behavior(ev_uuid)
        except AttributeError:
            warnings.warn(f"{report_type} has no behavior assertions. Checking only that it arrived.")
            extrctn_errs = []

        ev_id = ev_resp.json()["data"]["results"][0]["id"]
        ps_id = ps_resp.json()["data"]["results"][0]["id"]

        del_ev_resp = self.client.delete(Endpoints.EVENTS, str(ev_id))
        self.assertIn(del_ev_resp.status_code, [codes.accepted, codes.no_content])

        del_ps_resp = self.client.delete(Endpoints.PICKSESSIONS, str(ps_id))
        self.assertIn(del_ps_resp.status_code, [codes.accepted, codes.no_content])

        if extrctn_errs:
            assert False, "Extraction Errors: " + ", ".join(extrctn_errs)

    # UTILS
    def _gen_uuid(self):
        UUID = str(uuid.uuid1())
        return UUID
    
    def _get_event(self, UUID):
        ev_params = {
            "UUID": UUID
        }
        ev_resp = self.client.get(Endpoints.EVENTS, params=ev_params)
        return ev_resp

    def _ev_exists(self, ev_uuid):
        ev_resp = self._get_event(ev_uuid)
        self.assertOk(ev_resp)
        num_evs = ev_resp.json()["data"]["count"]
        return num_evs != 0

    def _ps_exists(self, ps_uuid):
        ps_resp = self._get_picksess(ps_uuid)
        self.assertOk(ps_resp)
        num_ps = ps_resp.json()["data"]["count"]
        return num_ps != 0

    def _get_picksess(self, UUID):
        ps_params = {
            "UUID": UUID
        }
        ps_resp = self.client.get(Endpoints.PICKSESSIONS, params=ps_params)
        return ps_resp

    def _load_upload_picksess_report(self, fruit, report_type, harv_id, ev_uuid, ps_uuid):
        fname = self.REPORT_FILEPATH_FMT.format(fruit, report_type)
        fpath = os.path.join(self.TEST_DATA_PATH, fname)

        with open(fpath, 'r') as f:
            report = json.load(f)
        
        report_time = time.time()

        report["timestamp"] = report_time
        report["uuid"] = ev_uuid
        report["pick_session_uuid"] = ps_uuid
        report["serial_number"] = harv_id

        tmp_fpath = os.path.join(self.TEST_DATA_PATH, f"{report_type}_{harv_id:03}_{ev_uuid}.json")
        with open(tmp_fpath, 'w') as f:
            json.dump(report, f)
        
        try:
            self.s3client.upload_file(tmp_fpath, prefix=report_type)
        finally:
            os.remove(tmp_fpath)

        return report
    
    # Report specific assertions
    def assert_errorreport_behavior(self, ev_uuid):
        extrctn_errs = []
        params = {
            "uuid": ev_uuid,
        }
        r = self.client.get(Endpoints.ERROR, params=params)
        self.assertOk(r)
        data = r.json()["data"]
        self.assertEqual(data["count"], 1)

        excs = data["results"][0]["exceptions"]
        try:
            self.assertGreater(len(excs), 0)
        except AssertionError:
            extrctn_errs.append("Found 0 exceptions")
        
        return extrctn_errs