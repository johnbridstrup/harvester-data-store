""" Test ErrorReport APIs """
from common.metrics import ERROR_COUNTER
from common.models import Tags
from common.tests import HDSAPITestBase
from harvester.models import Harvester
from event.models import Event
from exceptions.models import AFTException
from ..models import ErrorReport, DEFAULT_UNKNOWN
from ..serializers.errorreportserializer import ErrorReportSerializer, FAILED_SPLIT_MSG
from django.utils.timezone import make_aware
from rest_framework import serializers, status
from taggit.models import Tag
from unittest.mock import patch
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

    def _extract_service_node(self, serv_str):
        serv_split = serv_str.split('.')
        return serv_split[0], serv_split[1]

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

        # Assert hash is extracted
        self.assertEqual(self.data["data"]["githash"], r.json()["data"]["githash"])

        # Assert branch name is "unknown"
        self.assertEqual(DEFAULT_UNKNOWN, r.json()["data"]["gitbranch"])

    def test_create_errorreport_with_uuid(self):
        """ create error report with uuid in data """
        UUID = "a-test-uuid-string"
        self.data['data']['uuid'] = UUID

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
        self.data["data"]["sysmon_report"]["serial_number"]= "99"
        # updating harv_id
        response = self.client.patch(
            f'{self.api_base_url}/errorreports/1/',
            self.data,
            format='json'
        )
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

    def test_get_with_params(self):
        data= self.data.copy()

        self.client.post(
            f'{self.api_base_url}/errorreports/',
            data,
            format='json'
        )
        data['data']['sysmon_report']['sysmon.0']['errors']['traychg.0']['handled'] = True
        self.client.post(
            f'{self.api_base_url}/errorreports/',
            data,
            format='json'
        )

        resp_unhandled = self.client.get(f'{self.api_base_url}/errorreports/?handled=0')
        resp_handled = self.client.get(f'{self.api_base_url}/errorreports/?handled=1')

        hand_data = resp_handled.json()['data']
        unhand_data = resp_unhandled.json()['data']

        self.assertEqual(hand_data['count'], 1)
        self.assertEqual(unhand_data['count'], 1)
        self.assertEqual(hand_data['results'][0]['exceptions'][0]['handled'], True)
        self.assertEqual(unhand_data['results'][0]['exceptions'][0]['handled'], False)

    def test_get_errorreport_by_id(self):
        """ get error report by id """
        self._post_error_report()

        response = self.client.get(f'{self.api_base_url}/errorreports/1/')
        self.assertEqual(response.status_code, 200)

    def test_extract_errors(self):
        self._post_error_report()
        report = ErrorReport.objects.get()
        errs = ErrorReportSerializer._extract_exception_data(report)
        
        errdict = self.data['data']['sysmon_report']['sysmon.0']['errors']
        serv_str = list(errdict.keys())[0]
        service, node = self._extract_service_node(serv_str)

        compare = {
            'code': errdict[serv_str]['code'],
            'service': service,
            'node': int(node),
            'robot': int(node),
            'traceback': errdict[serv_str]['traceback'],
            'info': errdict[serv_str]['value'],
            'timestamp': ErrorReportSerializer.extract_timestamp(errdict[serv_str]['ts']),
            'handled': False
        }
        self.assertDictEqual(errs[0], compare)

        # Handled error
        data = self.data.copy()
        data['data']['sysmon_report']['sysmon.0']['errors']['traychg.0']['handled'] = True
        self.client.post(f'{self.api_base_url}/errorreports/', data, format='json')
        report = ErrorReport.objects.get(id=2)
        errs = ErrorReportSerializer._extract_exception_data(report)

        compare['handled'] = True
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

    def test_create_emu_report(self):
        Harvester.objects.create(**{
            'harv_id': 1100,
            'fruit': self.test_objects["fruit"],
            'location': self.test_objects["location"],
            'name': 'Harvester 1',
            'creator': self.user,
            'is_emulator': True
        })

        data = self.data.copy()
        data['data']['sysmon_report']['fruit'] = self.test_objects['fruit'].name
        data['data']['sysmon_report']['is_emulator'] = True

        self.assertEqual(data['data']['serial_number'], '011')

        resp = self.client.post(
            f'{self.api_base_url}/errorreports/', 
            data, 
            format='json'
        )

        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)
        resp_data = resp.json()['data']

        # Assert we used the emulated harvester and not harv 11
        self.assertEqual(resp_data['harvester']['harv_id'], 1100)

    def test_get_emu_get_non_emu(self):
        # Create real harv report
        self.client.post(
            f'{self.api_base_url}/errorreports/', 
            self.data, 
            format='json'
        )

        # Create emulator report
        Harvester.objects.create(**{
            'harv_id': 1100,
            'fruit': self.test_objects["fruit"],
            'location': self.test_objects["location"],
            'name': 'Harvester 1',
            'creator': self.user,
            'is_emulator': True
        })

        data = self.data.copy()
        data['data']['sysmon_report']['fruit'] = self.test_objects['fruit'].name
        data['data']['sysmon_report']['is_emulator'] = True
        self.client.post(
            f'{self.api_base_url}/errorreports/', 
            data, 
            format='json'
        )

        self.assertEqual(Harvester.objects.count(), 2)

        # get all
        resp = self.client.get(f'{self.api_base_url}/errorreports/')
        all_data = resp.json()['data']
        self.assertEqual(all_data['count'], 2)

        # get real
        resp = self.client.get(f'{self.api_base_url}/errorreports/?is_emulator=0')
        real_data = resp.json()['data']
        self.assertEqual(real_data['count'], 1)
        self.assertEqual(real_data['results'][0]['harvester']['harv_id'], 11)
        self.assertFalse(real_data['results'][0]['harvester']['is_emulator'])

        # # get emu
        resp = self.client.get(f'{self.api_base_url}/errorreports/?is_emulator=1')
        emu_data = resp.json()['data']
        self.assertEqual(emu_data['count'], 1)
        self.assertEqual(emu_data['results'][0]['harvester']['harv_id'], 1100)
        self.assertTrue(emu_data['results'][0]['harvester']['is_emulator'])

    @patch('errorreport.serializers.errorreportserializer.logging')
    def test_catch_extract_exc_errors(self, mock_logger):
        data = self.data.copy()
        # replace traychg.0 error with no '.' to split on
        data['data']['sysmon_report']['sysmon.0']['errors'] = {
            'traychg_0': {}
        }
        expected_error = ValueError.__name__
        counter = ERROR_COUNTER.labels(expected_error, FAILED_SPLIT_MSG, ErrorReportSerializer.__name__)

        r = self.client.post(
            f'{self.api_base_url}/errorreports/', 
            data, 
            format='json'
        )
        self.assertEqual(r.status_code, status.HTTP_201_CREATED)
        self.assertEqual(ErrorReport.objects.count(),1)
        self.assertEqual(AFTException.objects.count(), 0)
        self.assertEqual(counter._value.get(), 1)

        mock_logger.exception.assert_called_with(FAILED_SPLIT_MSG)

        # Assert tag assigned
        report = ErrorReport.objects.get()
        tag = report.tags.get()
        self.assertEqual(tag, Tag.objects.get())
        self.assertEqual(tag.name, Tags.INCOMPLETE.value)

        # Assert tags in response
        resp_data = r.json()['data']
        self.assertIn("tags", resp_data)
        self.assertIn(Tags.INCOMPLETE.value, resp_data['tags'])

        # Assert counter continues increasing
        self.client.post(
            f'{self.api_base_url}/errorreports/', 
            data, 
            format='json'
        )
        
        self.assertEqual(counter._value.get(), 2)

    ## Schema validation tests
    @patch("common.serializers.reportserializer.logging")
    def test_create_errorreport_invalid_schema(self, mock_logger):
        # This tests that we reject error reports that will fail to ingest
        # and make this visible to devs
        self.data['data'] = {}
        r = self.client.post(f'{self.api_base_url}/errorreports/', self.data, format='json')

        self.assertEqual(r.status_code, status.HTTP_400_BAD_REQUEST)

        msg = "Failed to validate: required"
        exc = serializers.ValidationError.__name__
        raised_by = ErrorReportSerializer.__name__
        counter = ERROR_COUNTER.labels(exc, msg, raised_by)
        self.assertEqual(counter._value.get(), 1)
        mock_logger.exception.assert_called_with("'sysmon_report' is a required property")
    
    def test_sysmon_entry_key_invalid(self):
        # Note: This also tests any invalid key, including ones without
        # info_ prepended.
        data = self.data.copy()
        data['data']['sysmon_report']['sysmon_0'] = {}
        resp = self.client.post(
            f'{self.api_base_url}/errorreports/', 
            data, 
            format='json'
        )
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)
        resp_errs = resp.json()['errors']['detail']
        self.assertIn("validation error", resp_errs)

    def test_new_info_key(self):
        data = self.data.copy()
        data['data']['sysmon_report']['info_str'] = "Some new information"
        data['data']['sysmon_report']['info_num'] = 10101
        data['data']['sysmon_report']['info_obj'] = {"new": "info"}

        resp = self.client.post(
            f'{self.api_base_url}/errorreports/', 
            data, 
            format='json'
        )
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)
