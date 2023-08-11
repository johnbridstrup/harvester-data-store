""" Test ErrorReport APIs """
import datetime
import time
from unittest.mock import patch
from urllib.parse import urlencode

from django.utils import timezone
from django.utils.timezone import make_aware
from rest_framework import serializers, status
from rest_framework.authtoken.models import Token

from common.async_metrics import ASYNC_ERROR_COUNTER, TOTAL_ERROR_COUNTER
from common.metrics import ERROR_COUNTER
from common.models import Tags
from common.tests import HDSAPITestBase, create_user
from common.reports import DTimeFormatter
from harvester.models import Harvester
from hds.roles import RoleChoices
from event.models import Event, PickSession
from exceptions.models import AFTException

from ..models import ErrorReport, DEFAULT_UNKNOWN
from ..serializers.errorreportserializer import ErrorReportSerializer, FAILED_SPLIT_MSG


class ErrorReportAPITest(HDSAPITestBase):
    def setUp(self):
        super().setUp()
        self.setup_basic()

        self.load_error_report()

    def _extract_service_node(self, serv_str):
        serv_split = serv_str.split('.')
        return serv_split[0], serv_split[1]

    def test_create_no_permission(self):
        user = create_user("user", "password")
        token = Token.objects.create(user=user)
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + token.key)
        r = self.client.post(self.error_url, self.data, format='json')
        self.assertEqual(r.status_code, status.HTTP_403_FORBIDDEN)

    def test_create_errorreport_no_uuid(self):
        """ create error report and assert it exists """
        r = self.post_error_report()
        # Assert report created
        self.assertEqual(ErrorReport.objects.count(), 1)

        # Assert exception created
        self.assertEqual(AFTException.objects.count(), 3)

        # Assert event created
        self.assertEqual(Event.objects.count(), 1)

        # Get the report
        resp = self.client.get(self.error_det_url(r["data"]["id"]))
        self.assertEqual(resp.status_code, status.HTTP_200_OK)

        # Assert representation correct
        self.assertIn("event", resp.data)
        self.assertEqual(
            f'/errorreports/{resp.data["id"]}/',
            resp.data['event']['related_objects'][0]['url']
        )

        # Assert hash is extracted
        self.assertEqual(self.data["data"]["githash"], r["data"]["githash"])

        # Assert branch name is "unknown"
        self.assertEqual(DEFAULT_UNKNOWN, r["data"]["gitbranch"])

    def test_create_errorreport_with_uuid(self):
        """ create error report with uuid in data """
        UUID = "a-test-uuid-string"
        self.load_error_report()
        self.data['uuid'] = UUID

        r = self.post_error_report(load=False)

        resp = self.client.get(self.error_det_url(r['data']['id']))

        self.assertEqual(UUID, resp.data['event']['UUID'])

    def test_event_and_picksess_created(self):
        self.post_error_report()
        self.assertEqual(Event.objects.count(), 1)
        self.assertEqual(PickSession.objects.count(), 1)

    def test_aux_events_created(self):
        dummies = ["dummy-uuid-1", "dummy-uuid-2"]
        self.data["aux_uuids"] = dummies
        self.post_error_report(load=False)
        self.assertEqual(Event.objects.count(), 1 + len(dummies))

        PRIMARY_UUID = self.data['uuid']
        prim_event = Event.objects.get(UUID=PRIMARY_UUID)

        self.assertEqual(prim_event.secondary_events.count(), len(dummies))
        for sec_event in prim_event.secondary_events.all():
            self.assertIn(sec_event.UUID, dummies)
            dummies.remove(sec_event.UUID)

    def test_create_errorreport_with_invalid_harvester(self):
        """ create error report with invalid harvester """
        data = self.data.copy()
        data["serial_number"] = 99
        response = self.client.post(self.error_url, data, format='json')
        self.assertEqual(response.status_code, 400)
        self.assertEqual(ErrorReport.objects.count(), 0)

        # Check counter increments
        expected_error = Harvester.DoesNotExist.__name__
        total_counter = TOTAL_ERROR_COUNTER.labels(expected_error, 'errorreport')
        self.assertEqual(total_counter._value.get(), 1)

    def test_update_errorreport(self):
        """ update error report and assert it exists """
        self.post_error_report()

        # updating reportTime
        current_time = make_aware(datetime.datetime.now().replace(microsecond=0))
        new_timestamp = current_time.timestamp()
        self.data["timestamp"] = new_timestamp

        self.client.patch(self.error_det_url(1), self.data, format='json', HTTP_ACCEPT='application/json')
        self.assertEqual(ErrorReport.objects.get().reportTime, current_time)

    def test_update_errorreport_with_invalid_data(self):
        """ update error report with invalid data """
        self.post_error_report()
        self.data["serial_number"]= "99"
        # updating harv_id
        response = self.client.patch(
            self.error_det_url(1),
            self.data,
            format='json'
        )
        self.assertEqual(response.status_code, 400)

    def test_delete_errorreport(self):
        """ delete error report and assert it does not exist """
        self.post_error_report()

        self.client.delete(self.error_det_url(1), HTTP_ACCEPT='application/json')
        self.assertEqual(ErrorReport.objects.count(), 0)

    def test_get_all_errorreports(self):
        """ get all error reports """
        data = self.data

        self.post_error_report()
        self.post_error_report()

        response = self.client.get(self.error_url, HTTP_ACCEPT='application/json')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["count"], 2)

    def test_get_with_params(self):
        data = self.data.copy()

        self.post_error_report()

        for d in data['data']['sysmon_report']['sysmon.0']['errors'].values():
            d['handled'] = True

        self.client.post(
            self.error_url,
            data,
            format='json'
        )

        resp_unhandled = self.client.get(f'{self.error_url}?handled=0')
        resp_handled = self.client.get(f'{self.error_url}?handled=1')

        hand_data = resp_handled.json()['data']
        unhand_data = resp_unhandled.json()['data']

        self.assertEqual(hand_data['count'], 1)
        self.assertEqual(unhand_data['count'], 1)
        self.assertEqual(hand_data['results'][0]['exceptions'][0]['handled'], True)
        self.assertEqual(unhand_data['results'][0]['exceptions'][0]['handled'], False)

        r_loc = self.client.get(f'{self.error_url}?locations={self.test_objects["location"].ranch}')
        r_no_loc = self.client.get(f'{self.error_url}?locations=otherlocation')
        self.assertEqual(r_loc.json()['data']['count'], 2)
        self.assertEqual(r_no_loc.json()['data']['count'], 0)

        r_codes = self.client.get(f'{self.error_url}?codes=0,1')
        r_non_codes = self.client.get(f'{self.error_url}?codes=1,2')
        self.assertEqual(r_codes.json()['data']['count'], 2)
        self.assertEqual(r_non_codes.json()['data']['count'], 0)

    def test_start_end_time(self):
        self.load_error_report()

        t1 = time.time() # This is a posix timestamp
        self.data['timestamp'] = t1 + .00001  # shift for gte and lte
        dt1 = timezone.datetime.fromtimestamp(t1) # This is UTC
        self.post_error_report(load=False)

        t2 = time.time()
        dt2 = timezone.datetime.fromtimestamp(t2)
        self.data['timestamp'] = t2 + .00001
        self.post_error_report(load=False)

        t3 = time.time()
        dt3 = timezone.datetime.fromtimestamp(t3)

        r1_before = self.client.get(f"{self.error_url}?end_time={dt1}&tz=utc")
        self.assertEqual(r1_before.json()['data']['count'], 0)
        r1_after = self.client.get(f"{self.error_url}?start_time={dt1}&tz=utc")
        self.assertEqual(r1_after.json()['data']['count'], 2)

        r2_before = self.client.get(f"{self.error_url}?end_time={dt2}&tz=utc")
        self.assertEqual(r2_before.json()['data']['count'], 1)
        r2_after = self.client.get(f"{self.error_url}?start_time={dt2}&tz=utc")
        self.assertEqual(r2_after.json()['data']['count'], 1)

        r3_before = self.client.get(f"{self.error_url}?end_time={dt3}&tz=utc")
        self.assertEqual(r3_before.json()['data']['count'], 2)
        r3_after = self.client.get(f"{self.error_url}?start_time={dt3}&tz=utc")
        self.assertEqual(r3_after.json()['data']['count'], 0)

    def test_get_errorreport_by_id(self):
        """ get error report by id """
        self.post_error_report()

        response = self.client.get(self.error_det_url(1))
        self.assertEqual(response.status_code, 200)

    def test_extract_errors(self):
        self.post_error_report()
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
            'timestamp': ErrorReportSerializer.extract_timestamp(errdict[serv_str], key="ts"),
            'handled': False
        }
        self.assertDictEqual(errs[0], compare)

        # Handled error
        data = self.data.copy()
        data['data']['sysmon_report']['sysmon.0']['errors'][serv_str]['handled'] = True
        self.client.post(self.error_url, data, format='json')
        report = ErrorReport.objects.get(id=2)
        errs = ErrorReportSerializer._extract_exception_data(report)

        compare['handled'] = True
        self.assertDictEqual(errs[0], compare)

        # Primary error
        excs = AFTException.objects.filter(report=report)
        self.assertEqual(sum([e.primary for e in excs]), 1) # one primary error

        primary = excs.filter(primary=True).get()
        self.assertTrue(all([primary.timestamp <= e.timestamp for e in excs])) # primary is first

    def test_err_report_str(self):
        self.post_error_report()
        inst = ErrorReport.objects.get()
        self.assertIn("*Error on Harvester", str(inst))
        self.assertIn("AFTBaseException", str(inst))
        self.assertIn("traychg.0", str(inst))

    def test_create_emu_report(self):
        Harvester.objects.create(**{
            'harv_id': 1100,
            'fruit': self.test_objects["fruit"],
            'location': self.test_objects["location"],
            'name': 'EMU',
            'creator': self.user,
            'is_emulator': True
        })

        data = self.data.copy()
        data['data']['sysmon_report']['fruit'] = self.test_objects['fruit'].name
        data['data']['sysmon_report']['is_emulator'] = True

        self.assertEqual(data['data']['serial_number'], '011')

        resp = self.client.post(
            self.error_url,
            data,
            format='json'
        )

        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)
        resp = self.client.get(self.error_det_url(resp.json()["data"]["id"]))

        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        resp_data = resp.json()['data']

        # Assert we used the emulated harvester and not harv 11
        self.assertEqual(resp_data['harvester']['harv_id'], 1100)

    def test_get_emu_get_non_emu(self):
        # Create real harv report
        self.client.post(
            self.error_url,
            self.data,
            format='json'
        )

        # Create emulator report
        Harvester.objects.create(**{
            'harv_id': 1100,
            'fruit': self.test_objects["fruit"],
            'location': self.test_objects["location"],
            'name': 'EMU',
            'creator': self.user,
            'is_emulator': True
        })

        data = self.data.copy()
        data['data']['sysmon_report']['fruit'] = self.test_objects['fruit'].name
        data['data']['sysmon_report']['is_emulator'] = True
        self.client.post(
            self.error_url,
            data,
            format='json'
        )

        self.assertEqual(Harvester.objects.count(), 2)

        # get all
        resp = self.client.get(self.error_url)
        all_data = resp.json()['data']
        self.assertEqual(all_data['count'], 2)

        # get real
        resp = self.client.get(f'{self.error_url}?is_emulator=0')
        real_data = resp.json()['data']
        self.assertEqual(real_data['count'], 1)
        self.assertEqual(real_data['results'][0]['harvester']['harv_id'], 11)
        self.assertFalse(real_data['results'][0]['harvester']['is_emulator'])

        # # get emu
        resp = self.client.get(f'{self.error_url}?is_emulator=1')
        emu_data = resp.json()['data']
        self.assertEqual(emu_data['count'], 1)
        self.assertEqual(emu_data['results'][0]['harvester']['harv_id'], 1100)
        self.assertTrue(emu_data['results'][0]['harvester']['is_emulator'])

    @patch('errorreport.serializers.errorreportserializer.logger')
    def test_catch_extract_exc_errors(self, mock_logger):
        data = self.data.copy()
        # replace traychg.0 error with no '.' to split on
        data['data']['sysmon_report']['sysmon.0']['errors'] = {
            'traychg_0': {}
        }
        expected_error = ValueError.__name__
        counter = ASYNC_ERROR_COUNTER.labels("_extract_exception_data", expected_error, FAILED_SPLIT_MSG)

        r = self.client.post(
            self.error_url,
            data,
            format='json'
        )

        self.assertEqual(r.status_code, status.HTTP_201_CREATED)
        self.assertEqual(ErrorReport.objects.count(),1)
        self.assertEqual(AFTException.objects.count(), 0)
        self.assertEqual(counter._value.get(), 1)

        mock_logger.exception.assert_called_with(FAILED_SPLIT_MSG, key='traychg_0')

        # Assert tag assigned
        report = ErrorReport.objects.get()
        tags = report.tags.all()
        self.assertEqual(len(tags), 1)
        self.assertIn(Tags.INCOMPLETE.value, [tag.name for tag in tags])

        # Assert tags in response
        r2 = self.client.get(self.error_det_url(1))
        resp_data = r2.json()['data']
        self.assertIn("tags", resp_data)
        self.assertIn(Tags.INCOMPLETE.value, resp_data['tags'])

        # Assert counter continues increasing
        self.client.post(
            self.error_url,
            data,
            format='json'
        )

        self.assertEqual(counter._value.get(), 2)

    def test_sysmon_entry_key_invalid(self):
        # Note: This also tests any invalid key, including ones without
        # info_ prepended.
        data = self.data.copy()
        data['data']['sysmon_report']['sysmon_0'] = {}
        resp = self.client.post(
            self.error_url,
            data,
            format='json'
        )

        # It will fail if the timestamp isn't there
        del data['timestamp']
        resp = self.client.post(
            self.error_url,
            data,
            format='json'
        )

        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)

    def test_new_info_key(self):
        data = self.data.copy()
        data['data']['sysmon_report']['info_str'] = "Some new information"
        data['data']['sysmon_report']['info_num'] = 10101
        data['data']['sysmon_report']['info_obj'] = {"new": "info"}

        resp = self.client.post(
            self.error_url,
            data,
            format='json'
        )
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)

    def test_get_schema(self):
        resp = self.client.get(f'{self.error_url}getschema/')
        self.assertEqual(resp.status_code, status.HTTP_200_OK)

        msg = resp.json()['message']
        data = resp.json()['data']

        self.assertEqual(
            msg,
            f"{ErrorReportSerializer.report_type} schema retrieved"
        )

        self.assertDictEqual(
            data,
            ErrorReportSerializer().get_schema()
        )

    def test_query_errorreport(self):
        # test the available query strings for errorreport
        res = self.post_error_report()
        res = self.client.get(self.error_det_url(res["data"]["id"]))
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        res_data = res.json()["data"]

        # query harv_ids associated with report
        harv_id = res_data['harvester']['harv_id']
        harv_dict = {
            'harv_ids': ','.join(map(str, [harv_id]))
        }
        resp = self.client.get(
            f'{self.error_url}?{urlencode(harv_dict)}'
        )
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(
            resp.json()["data"]["results"][0]["harvester"]["harv_id"],
            harv_id
        )

        # query harv_ids not associated with report
        harvester = self.create_harvester_object(**{
            'harv_id': 20,
            'fruit': self.test_objects["fruit"],
            'location': self.test_objects["location"],
            'name': 'Harvester 2',
            'creator': self.user
        })
        harv_dict.update({
            'harv_ids': ','.join(map(str, [harvester.harv_id]))
        })
        resp = self.client.get(
            f'{self.error_url}?{urlencode(harv_dict)}'
        )
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(len(resp.json()["data"]["results"]), 0)

        # query ranches associated with report
        ranch = res_data['location']['ranch']
        ranch_dict = {
            'locations': ','.join(map(str, [ranch]))
        }
        resp = self.client.get(
            f'{self.error_url}?{urlencode(ranch_dict)}'
        )
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(
            resp.json()["data"]["results"][0]["location"]["ranch"],
            ranch
        )

        # query ranches not associated with report
        location = self.create_location_object(**{
            "distributor": self.test_objects["distributor"],
            "ranch": "Ranch X",
            "country": "US",
            "region": "California",
            'creator': self.user
        })
        ranch_dict.update({
            'locations': ','.join(map(str, [location.ranch]))
        })
        resp = self.client.get(
            f'{self.error_url}?{urlencode(harv_dict)}'
        )
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(len(resp.json()["data"]["results"]), 0)

        # query start_time
        start_dict = {'start_time': DTimeFormatter.localize_to_tz(
            self.data["timestamp"]
        )}
        resp = self.client.get(
            f'{self.error_url}?{urlencode(start_dict)}'
        )
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(len(resp.json()["data"]["results"]), 1)

        # query start_time add 1
        start_dict = {'start_time': DTimeFormatter.localize_to_tz(
            self.data["timestamp"], inc=True
        )}
        resp = self.client.get(
            f'{self.error_url}?{urlencode(start_dict)}'
        )
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(len(resp.json()["data"]["results"]), 0)

        # query end_time
        end_dict = {'end_time': DTimeFormatter.localize_to_tz(
            self.data["timestamp"]
        )}
        resp = self.client.get(
            f'{self.error_url}?{urlencode(end_dict)}'
        )
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(len(resp.json()["data"]["results"]), 1)

        # query end_time subtract 1
        end_dict = {'end_time': DTimeFormatter.localize_to_tz(
            self.data["timestamp"], dec=True
        )}
        resp = self.client.get(
            f'{self.error_url}?{urlencode(end_dict)}'
        )
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(len(resp.json()["data"]["results"]), 0)

        # query fruits associated with report
        fruit = self.test_objects['fruit']
        fruit_dict = {
            'fruits': ','.join(map(str, [fruit.name]))
        }
        resp = self.client.get(
            f'{self.error_url}?{urlencode(fruit_dict)}'
        )
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(
            resp.json()["data"]["results"][0]["harvester"]["fruit"]["id"],
            fruit.id
        )

        # query fruits not associated with report
        fruit = self.create_fruit_object('apple')
        fruit_dict.update({
            'fruits': ','.join(map(str, [fruit.name]))
        })
        resp = self.client.get(
            f'{self.error_url}?{urlencode(fruit_dict)}'
        )
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(len(resp.json()["data"]["results"]), 0)

        # query exception codes
        code = self.test_objects['code'].code
        codes_dict = {
            'codes': ','.join(map(str, [code]))
        }
        resp = self.client.get(
            f'{self.error_url}?{urlencode(codes_dict)}'
        )
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(
            resp.json()["data"]["results"][0]["exceptions"][0]["code"]["code"],
            code
        )

        self.data['data']['sysmon_report']['sysmon.0']['errors']['harvester.0']['traceback'] = "findme"
        self.post_error_report(load=False)
        # query traceback
        trace_dict = {
            'traceback': "findme"
        }
        resp = self.client.get(
            f'{self.error_url}?{urlencode(trace_dict)}'
        )
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(len(resp.json()["data"]["results"]), 1)

        # generic
        self.data['data']['sysmon_report']['sysmon.0']['PID'] = '111'
        self.post_error_report(load=False)
        generic_dict = {
            "generic": "report__data__sysmon_report__sysmon.0__PID=111"
        }

        r_gen = self.client.get(
            f'{self.error_url}?{urlencode(generic_dict)}'
        )
        self.assertEqual(r_gen.json()['data']['count'], 1)

        # primary exception codes with primary flag set to true
        # e.g 0*,0*
        excs = AFTException.objects.filter()
        self.assertEqual(sum([e.primary for e in excs]), 3)

        codes = [x.code.code for x in excs.filter(primary=True)]
        code_dict = {
            'codes': ','.join(map(str, set(codes))),
            'primary': True
        }
        resp = self.client.get(
            f'{self.error_url}?{urlencode(code_dict)}'
        )
        self.assertEqual(resp.json()['data']['count'], 3)

        # primary exception codes with primary flag set to false
        # e.g 0*,0
        code_dict = {
            'codes': ','.join(map(str, set(codes))),
            'primary': False
        }
        resp = self.client.get(
            f'{self.error_url}?{urlencode(code_dict)}'
        )
        self.assertEqual(resp.json()['data']['count'], 3)

        # non primary codes with primary flag set to true
        # e.g 0,0
        for ex in excs:
            ex.primary = False # modify all to be non primary
            ex.save()
        codes = [x.code.code for x in AFTException.objects.filter()]
        code_dict = {
            'codes': ','.join(map(str, set(codes))),
            'primary': True
        }
        resp = self.client.get(
            f'{self.error_url}?{urlencode(code_dict)}'
        )
        self.assertEqual(resp.json()['data']['count'], 0)

        # non primary codes with primary flag set to false
        # e.g 0,0
        code_dict = {
            'codes': ''.join(map(str, set(codes))),
            'primary': False
        }
        resp = self.client.get(
            f'{self.error_url}?{urlencode(code_dict)}'
        )
        self.assertEqual(resp.json()['data']['count'], 3)

    def test_create_report_withno_exceptions(self):
        self.load_error_report()
        self.data["data"]["sysmon_report"]["sysmon.0"].pop("errors")
        res = self.post_error_report(load=False)

        # assert no exception created
        self.assertEqual(len(res["data"]["exceptions"]), 0)
        excs = AFTException.objects.filter()
        self.assertEqual(len(excs), 0)

        # query for primary flag set to true
        primary_dict = {
            'primary': True
        }
        resp = self.client.get(
            f'{self.error_url}?{urlencode(primary_dict)}'
        )
        self.assertEqual(resp.json()['data']['count'], 0)

        # query for primary flag set to false
        primary_dict = {
            'primary': False
        }
        resp = self.client.get(
            f'{self.error_url}?{urlencode(primary_dict)}'
        )
        self.assertEqual(resp.json()['data']['count'], 0)

        # query for harvester only
        harv_only = {
            'is_emulator': False
        }
        resp = self.client.get(
            f'{self.error_url}?{urlencode(harv_only)}'
        )
        self.assertEqual(resp.json()['data']['count'], 1)

        # query for harv_ids
        harvids_dict = {
            'harv_ids': ''.join(map(str, [11]))
        }
        resp = self.client.get(
            f'{self.error_url}?{urlencode(harvids_dict)}'
        )
        self.assertEqual(resp.json()['data']['count'], 1)

        # query for fruits
        fruit_dict = {
            'fruits': ''.join(map(str, ['strawberry']))
        }
        resp = self.client.get(
            f'{self.error_url}?{urlencode(fruit_dict)}'
        )
        self.assertEqual(resp.json()['data']['count'], 1)

        fruit_dict = {
            'fruits': ''.join(map(str, ['apple']))
        }
        resp = self.client.get(
            f'{self.error_url}?{urlencode(fruit_dict)}'
        )
        self.assertEqual(resp.json()['data']['count'], 0)

    def test_filter_for_time_of_day(self):
        self.post_error_report()
        self.load_error_report()
        ts = datetime.datetime(2023, 8, 1, 13, 0, 0).timestamp()
        self.data["timestamp"] = ts
        self.post_error_report(load=False)
        ts = datetime.datetime(2023, 8, 7, 17, 0, 0).timestamp()
        self.data["timestamp"] = ts
        self.post_error_report(load=False)
        ts = datetime.datetime(2023, 8, 15, 18, 0, 0).timestamp()
        self.data["timestamp"] = ts
        self.post_error_report(load=False)

        # filter for errors that occured btw May 1 and May 30
        # for time range between 8PM and 10PM
        # should return 1 report
        filter_dict = {
            'start_time': '2022-05-01',
            'end_time': '2022-05-30',
            'start_hour': '20:00',
            'end_hour': '22:00',
        }
        resp = self.client.get(
            f'{self.error_url}?{urlencode(filter_dict)}'
        )
        self.assertEqual(resp.json()['data']['count'], 1)

        # filter for errors that occured btw May 1 and May 2
        # for time range between 8PM and 10PM
        # should return 0 reports
        filter_dict = {
            'start_time': '2022-05-01',
            'end_time': '2022-05-02',
            'start_hour': '20:00',
            'end_hour': '22:00',
        }
        resp = self.client.get(
            f'{self.error_url}?{urlencode(filter_dict)}'
        )
        self.assertEqual(resp.json()['data']['count'], 0)

        # filter for errors that occured btw May 1 and May 30
        # for time range between 5AM and 8AM
        # should return 0 reports
        filter_dict = {
            'start_time': '2022-05-01',
            'end_time': '2022-05-02',
            'start_hour': '05:00',
            'end_hour': '08:00',
        }
        resp = self.client.get(
            f'{self.error_url}?{urlencode(filter_dict)}'
        )
        self.assertEqual(resp.json()['data']['count'], 0)

        # filter for errors that occured btw Aug 1 and Aug 7
        # for time range between 1PM and 5PM
        # should return 2 reports
        filter_dict = {
            'start_time': '2023-08-01',
            'end_time': '2023-08-08',
            'start_hour': '13:00',
            'end_hour': '17:00',
        }
        resp = self.client.get(
            f'{self.error_url}?{urlencode(filter_dict)}'
        )
        self.assertEqual(resp.json()['data']['count'], 2)

        # filter for errors that occured btw Aug 15 and Aug 17
        # for time range between 5PM and 8PM
        # should return 1 reports
        filter_dict = {
            'start_time': '2023-08-15',
            'end_time': '2023-08-17',
            'start_hour': '17:00',
            'end_hour': '19:00',
        }
        resp = self.client.get(
            f'{self.error_url}?{urlencode(filter_dict)}'
        )
        self.assertEqual(resp.json()['data']['count'], 1)

