import json
import pytz
from datetime import datetime

from ..models import AFTException
from ..insights import create_traceback_groups
from .test_exc_code_api import ExceptionTestBase


class AFTExceptionTest(ExceptionTestBase):
    def setUp(self):
        super().setUp()
        self.setup_basic()
        self.load_error_report()

    def _send_exception(self, code=0, service="testservice", node=1):
        ts = datetime.now().replace(tzinfo=pytz.utc)

        resp = self.client.post(
            self.exc_url,
            {
                "code": code,
                "service": service,
                "node": node,
                "robot": node,
                "value": "Test value",
                "traceback": "Test traceback",
                "timestamp": str(ts),
            },
        )

        return resp

    def test_create_exception(self):
        resp = self._send_code()
        resp = self._send_exception()

        self.assertEqual(resp.status_code, 201)
        self.assertEqual(AFTException.objects.count(), 1)
        self.assertEqual(AFTException.objects.get().code.code, self.CODE)

    def test_delete_exception(self):
        self._send_code()
        resp = self._send_exception()
        self.assertEqual(resp.status_code, 201)

        self.client.delete(self.exc_det_url(1))
        self.assertEqual(AFTException.objects.count(), 0)

    def test_get_all_exceptions(self):
        self._send_code(0)
        self._send_exception()
        self._send_exception(service="otherservice")

        resp = self.client.get(self.exc_url)
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.data["count"], 2)

    def test_get_exception_by_id(self):
        self._send_code()
        self._send_exception()
        resp = self.client.get(self.exc_det_url(1))
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.data["code"]["code"], 0)

    def test_get_primary(self):
        self.post_error_report()
        self.assertEqual(AFTException.objects.count(), 3)
        resp = self.client.get(f"{self.exc_url}?primary=True")
        self.assertEqual(resp.json()["data"]["count"], 1)

    def test_get_date_range(self):
        self.post_error_report()
        resp = self.client.get(
            f"{self.exc_url}?datetime_range=20220101T000100.0,20220430T235955.0"
        )
        self.assertEqual(resp.json()["data"]["count"], 1)

    def test_get_start_end(self):
        self.post_error_report()
        resp = self.client.get(f"{self.exc_url}?start_time=202201010001")
        self.assertEqual(resp.json()["data"]["count"], 2)

        resp = self.client.get(f"{self.exc_url}?end_time=20220430235955")
        self.assertEqual(resp.json()["data"]["count"], 2)

        resp = self.client.get(
            f"{self.exc_url}?start_time=202201010001&end_time=20220430235955"
        )
        self.assertEqual(resp.json()["data"]["count"], 1)

    def test_tb_breakdown_task(self):
        self.post_error_report()
        excs = AFTException.objects.all().values(
            "id",
            "timestamp",
            "traceback",
            "code__code",
            "report__report__data__sysmon_report__emu_info__agent_label",
        )
        groups = create_traceback_groups(excs)
        try:
            json.dumps(groups)
            assert True
        except Exception as e:
            assert False, f"Failed to serialize traceback groups: {e}"

    def test_get_harv_ids(self):
        self.post_error_report()
        self.create_harvester_object(
            10,
            name="harv10",
            fruit=self.test_objects["fruit"],
            location=self.test_objects["location"],
            creator=self.user,
        )
        self.data["serial_number"] = "010"
        self.post_error_report(load=False)
        self.create_harvester_object(
            9,
            name="harv9",
            fruit=self.test_objects["fruit"],
            location=self.test_objects["location"],
            creator=self.user,
        )
        self.data["serial_number"] = "009"
        self.post_error_report(load=False)

        resp = self.client.get(f"{self.exc_url}?harv_ids=9,10")
        self.assertEqual(resp.json()["data"]["count"], 6)

    def test_generate_pareto(self):
        pareto_groups = [
            "code__code",
            "code__name",
            "service",
            "report__harvester__harv_id",
        ]
        pareto_names = ["code", "exception", "service", "harvester"]
        pareto_name_vals = ["0", "AFTBaseException", "harvester", "11"]
        pareto_counts = [15, 15, 5, 15]
        num = 5
        for _ in range(num):
            self.client.post(
                f"{self.api_base_url}/errorreports/",
                self.data,
                format="json",
                HTTP_ACCEPT="application/json",
            )

        def check_pareto(group, name, name_val, count):
            resp = self.client.get(
                f"{self.exc_url}pareto/?aggregate_query={group}&aggregate_name={name}"
            )
            self.assertEqual(resp.status_code, 200)
            rdata = resp.json()

            self.assertEqual(rdata["message"], f"Pareto generated: {name}")
            self.assertEqual(rdata["data"][0]["count"], count)
            self.assertEqual(rdata["data"][0][name], name_val)

        for group, name, val, count in zip(
            pareto_groups, pareto_names, pareto_name_vals, pareto_counts
        ):
            check_pareto(group, name, val, count)
