""" Test ErrorReport APIs """
from common.tests import HDSAPITestBase
from event.models import Event
from exceptions.models import AFTException
from ..models import ErrorReport
from ..serializers.errorreportserializer import ErrorReportSerializer
from django.utils.timezone import make_aware
import datetime
import json
import os


class ErrorReportAPITest(HDSAPITestBase):
    def setUp(self):
        super().setUp()
        self.test_objects = self._setup_basic()

        report_json_path = os.path.join(os.path.abspath(os.path.dirname(__file__)), 'report.json') 
        with open(report_json_path) as f:
            self.data = json.load(f)

    def test_create_errorreport_no_uuid(self):
        """ create error report and assert it exists """
        r = self.client.post(f'{self.api_base_url}/errorreports/', self.data, format='json', HTTP_ACCEPT='application/json')

        # Assert report created
        self.assertEqual(ErrorReport.objects.count(), 1)

        # Assert exception created
        self.assertEqual(AFTException.objects.count(), 1)

        # Assert event created
        self.assertEqual(Event.objects.count(), 1)

        # Assert representation correct
        self.assertIn("event", r.json()['data'])
        self.assertEqual(
            f'/errorreports/{r.json()["data"]["id"]}/',
            r.json()['data']['event']['related_objects'][0]['url']
        )

    def test_create_errorreport_with_uuid(self):
        """ create error report with uuid in data """
        UUID = "a-test-uuid-string"
        self.data['uuid'] = UUID

        r = self.client.post(f'{self.api_base_url}/errorreports/', self.data, format='json', HTTP_ACCEPT='application/json')

        self.assertEqual(UUID, r.json()['data']['event']['UUID'])

    def test_create_errorreport_with_invalid_harvester(self):
        """ create error report with invalid harvester """
        data = self.data.copy()
        data["data"]["sysmon_report"]["serial_number"] = 99
        response = self.client.post(f'{self.api_base_url}/errorreports/', data, format='json')
        self.assertEqual(response.status_code, 400)
        self.assertEqual(ErrorReport.objects.count(), 0)

    def test_update_errorreport(self):
        """ update error report and assert it exists """
        self._post_error_report()

        # updating reportTime
        current_time = make_aware(datetime.datetime.now().replace(microsecond=0))
        new_timestamp = current_time.timestamp()
        self.data["timestamp"] = new_timestamp

        self.client.patch(f'{self.api_base_url}/errorreports/1/', self.data, format='json', HTTP_ACCEPT='application/json')
        self.assertEqual(ErrorReport.objects.get().reportTime, current_time)

    def test_update_errorreport_with_invalid_data(self):
        """ update error report with invalid data """
        self._post_error_report()

        # updating harv_id
        response = self.client.patch(
            f'{self.api_base_url}/errorreports/1/',
            {self.data["data"]["sysmon_report"]["serial_number"]: "99"})
        self.assertEqual(response.status_code, 400)

    def test_delete_errorreport(self):
        """ delete error report and assert it does not exist """
        data = self.data.copy()
        report_time = make_aware(datetime.datetime.fromtimestamp(data["timestamp"]))

        self._post_error_report()

        self.client.delete(f'{self.api_base_url}/errorreports/1/', HTTP_ACCEPT='application/json')
        self.assertEqual(ErrorReport.objects.count(), 0)

    def test_get_all_errorreports(self):
        """ get all error reports """
        data = self.data
        report_time = make_aware(datetime.datetime.fromtimestamp(data["timestamp"]))

        self._post_error_report()
        self._post_error_report()

        response = self.client.get(f'{self.api_base_url}/errorreports/', HTTP_ACCEPT='application/json')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["count"], 2)

    def test_get_errorreport_by_id(self):
        """ get error report by id """
        self._post_error_report()

        response = self.client.get(f'{self.api_base_url}/errorreports/1/')
        self.assertEqual(response.status_code, 200)

    def test_extract_errors(self):
        errs = ErrorReportSerializer._extract_exception_data(self.data['data']['sysmon_report'])
        
        errdict = self.data['data']['sysmon_report']['sysmon.0']['errors']
        serv = 'traychg.0'

        compare = {
            'code': errdict[serv]['code'],
            'service': serv.split('.')[0],
            'node': int(serv.split('.')[1]),
            'traceback': errdict[serv]['traceback'],
            'timestamp': ErrorReportSerializer.extract_timestamp(errdict[serv]['ts'])
        }
        self.assertDictEqual(errs[0], compare)

    def test_generate_pareto(self):
        pareto_groups = ["code__code", "code__name", "service", "report__harvester__harv_id"]
        pareto_names = ["code", "exception", "service", "harvester"]
        pareto_name_vals = ["0", "AFTBaseException", "traychg", "11"]
        num = 5
        for _ in range(num):
            self.client.post(f'{self.api_base_url}/errorreports/', self.data, format='json', HTTP_ACCEPT='application/json')

        def check_pareto(group, name, name_val, count):
            resp = self.client.get(
                f'{self.api_base_url}/errorreports/pareto/?aggregate_query={group}&aggregate_name={name}'
            )
            self.assertEqual(resp.status_code, 200)
            rdata = resp.json()

            self.assertEqual(rdata['message'], f'Pareto generated: {name}')
            self.assertEqual(rdata['data'][0]['count'], count)
            self.assertEqual(rdata['data'][0][name], name_val)
        
        for group, name, val in zip(pareto_groups, pareto_names, pareto_name_vals):
            check_pareto(group, name, val, num)

    def test_create_notification(self):
        params = "?harv_ids=100"
        data = {
            "trigger_on": "ErrorReport",
            "recipients": [1]
        }
        resp = self.client.post(
            f'{self.api_base_url}/errorreports/createnotification/{params}', 
            data, 
            format='json', 
            HTTP_ACCEPT='application/json'
        )
        self.assertEqual(resp.status_code, 200)

    def test_err_report_str(self):
        self._post_error_report()
        inst = ErrorReport.objects.get()
        self.assertIn("*Error on Harvester", str(inst))
        self.assertIn("AFTBaseException", str(inst))
        self.assertIn("traychg.0", str(inst))