import time

from locust import task, between
from base import UserBase


class AdminUser(UserBase):
    wait_time = between(100, 200)

    @task
    def go_to_panel(self):
        self.get("/admin")


class DevUser(UserBase):
    wait_time = between(1, 5)

    @task
    def get_error_reports_then_pareto(self):
        ep1 = "/api/v1/errorreports/"
        self.get(ep1)
        time.sleep(1)

        tb_filter1 = "one"  # matches one traceback
        tb_filter2 = "different"  # matches two tracebacks

        self.get(ep1, params={"traceback": tb_filter1})
        time.sleep(1)
        self.get(ep1, params={"traceback": tb_filter2})
        time.sleep(1)

        ep2 = "/api/v1/exceptions/pareto/"
        self.get(ep2)


class SQSUser(UserBase):
    wait_time = between(1, 2)

    def on_start(self):
        UserBase.on_start(self)
        self._load_error_report()

    def _load_error_report(self):
        self.erreport = self._load_json("report.json")

    @task
    def post_error_report(self):
        ep1 = "/api/v1/errorreports/"
        self.post(ep1, json=self.erreport)
