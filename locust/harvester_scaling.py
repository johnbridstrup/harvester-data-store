# Simulating harvesters as we scale
import gevent
import greenlet
import math
import random
import time

from locust import between, task
from base import UserBase


class HarvesterUser(UserBase):
    """A mock harvester.

    This user simulates a harvesters behavior during normal picking operations.

    Harvesters have four essential "events" which result in hitting the API:
       - Arming
       - Stop picking
       - Handled errors
       - Version uploads

    """

    ENDPOINTS = {
        "error": "/api/v1/errorreports/",
        "config": "/api/v1/aftconfigs/",
        "picksess": "/api/v1/gripreports/",
        "autodiag": "/api/v1/autodiagnostics/",
        "files": "/api/v1/s3files/",
        "sessclip": "/api/v1/sessclip/",
        "assets": "/api/v1/harvassetreport/",
        "version": "/api/v1/harvversion/",
    }

    wait_time = between(
        20, 120
    )  # Range of times between harvester arm/pick cycles
    ERR_PER_HR = 1  # One error per hour of picking. Maybe generous...
    HANDLED_ERR_PERCENT = 0.3  # Rough percentage of errors that are handled
    FULL_ROW_TIME = 30 * 60  # Seconds spent picking if all goes well
    VERSION_CADENCE = 60  # Every minute we upload version

    def on_start(self):
        UserBase.on_start(self)
        self.worker_id = greenlet.getcurrent().minimal_ident
        self._create_me_if_needed()
        self._load_and_adjust_reports()

    @task
    def harvester_behavior(self):
        elapsed_time = 0
        # User behavior
        self._arm_harvester()
        self._version_upload()
        event_t, event, do_continue = self._next_event()
        while elapsed_time < self.FULL_ROW_TIME:
            elapsed_time += self.VERSION_CADENCE
            if elapsed_time > event_t:
                event()
                if not do_continue:
                    break
                event_t, event, do_continue = self._next_event(elapsed_time)
            self.async_wait(
                self.VERSION_CADENCE
            )  # Let's assume for now the version cadence is high enough resolution.
            self._version_upload()
        # Stop picking
        self._stop_picking()

    ###########################
    ## Sub-Task Implementations
    ###########################

    def _arm_harvester(self):
        """Harvester arm sub-task.

        Uploads:
           - Configs (all)
           - Assets (all)
           - Autodiagnostics x4-6 (all)
        """
        self.post(self.ENDPOINTS["config"], json=self.config)
        self.post(self.ENDPOINTS["assets"], json=self.assets)
        for _ in range(4):
            self.post(self.ENDPOINTS["autodiag"], json=self.autodiag)
            time.sleep(0.1)

    def _stop_picking(self):
        """Harvester stop picking sub-task.

        A harvester will stop picking for a number of reasons. Nominal
        reasons include end of row or the operator presses the green
        button. When we stop picking we upload a pick session report.

        Uploads:
           - Pick session report
        """
        self.post(self.ENDPOINTS["picksess"], json=self.picksess)

    def _error(self):
        """Handled error sub-task.

        Harvester will occasionally error in a way that doesn't stop picking.
        Only error related uploads happen in this event.

        Uploads:
           - Error report
           - Sessclip
           - dmesg .txt file
        """
        self.post(self.ENDPOINTS["error"], json=self.erreport)

    def _version_upload(self):
        """Version upload sub-task.

        Harvesters upload version reports on a one/minute cadence.

        Uploads:
           - Version report
        """
        self.post(self.ENDPOINTS["version"], json=self.versions)

    #######################
    ## Kinetic Monte Carlo
    #######################

    def _next_event(self, elapsed_time=0):
        """Determine when the next event occurs.

        Use kinetic monte carlo to determine the next event. Right now,
        These are only error or handled error but could be anything.

        Events here should occur on the order of 10s of minutes in frequency.

        Args:
            elapsed_time (int): _description_

        Returns:
            (int, event, bool): dt, event method, and whether to continue to the next event
        """
        # Kinetic Monte Carlo
        # https://en.wikipedia.org/wiki/Kinetic_Monte_Carlo
        r_err = self.ERR_PER_HR / 3600
        r_hand = r_err * (1 + self.HANDLED_ERR_PERCENT)

        Q = r_err + r_hand
        uQ = Q * random.random()
        evt_t = round((1 / Q) * math.log(1 / random.random())) + elapsed_time

        if uQ < r_err:
            return evt_t, self._error, False
        if uQ < Q:
            return evt_t, self._error, True

    ######################
    # Utilities
    ######################

    def async_wait(self, seconds):
        gevent.sleep(seconds)

    def _load_and_adjust_reports(self):
        self._load_assets()
        self._load_configs()
        self._load_auto_diag()
        self._load_error_report()
        self._load_version()
        self._load_picksess_report()

    def _create_me_if_needed(self):
        ep = "/api/v1/harvesters/"

        r = self.get(ep, params={"harv_id": self.worker_id}, name="Get Harv ID")
        if r.json()["data"]["count"] > 0:
            return
        harv = {
            "harv_id": self.worker_id,
            "fruit": 1,
            "location": 1,
            "name": f"worker_{self.worker_id}",
        }
        self.post(ep, json=harv, name="Create Harv")

    def _adjust_serial_num(self, report):
        report["serial_number"] = self.worker_id

    def _load_error_report(self):
        self.erreport = self._load_json("report.json")
        self._adjust_serial_num(self.erreport)

    def _load_configs(self):
        self.config = self._load_json(
            "configs-report_002_1675256694.218969.json"
        )
        self._adjust_serial_num(self.config)

    def _load_assets(self):
        self.assets = self._load_json("serialnums.json")
        self._adjust_serial_num(self.assets)

    def _load_auto_diag(self):
        self.autodiag = self._load_json("autodiag_report.json")
        self._adjust_serial_num(self.autodiag)

    def _load_version(self):
        self.versions = self._load_json("version.json")
        self._adjust_serial_num(self.versions)

    def _load_picksess_report(self):
        self.picksess = self._load_big_json("picksessreport.json")
        self._adjust_serial_num(self.picksess)
