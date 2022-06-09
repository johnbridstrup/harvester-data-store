""" Test ErrorReport APIs """
from rest_framework.test import APITestCase
from rest_framework.test import APIClient
from rest_framework.authtoken.models import Token
from harvester.models import Harvester, Fruit
from location.models import Location, Distributor
from ..models import ErrorReport
from django.contrib.auth.models import User
from django.utils.timezone import make_aware
import datetime
import json
import os


class ErrorReportAPITest(APITestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create(username='test_user')
        self.distributor = Distributor.objects.create(name='Distributor 1', creator=self.user)
        self.location = Location.objects.create(
            distributor=self.distributor, ranch='Ranch 1', country='USA', region='Region 1', creator=self.user)
        self.fruit = Fruit.objects.create(name='Strawberry', creator=self.user)
        self.harvester = Harvester.objects.create(harv_id=11, fruit=self.fruit, location=self.location, name='Harvester 1', creator=self.user)
        self.token = Token.objects.create(user=self.user)
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + self.token.key)
        self.api_base_url = '/api/v1'

        # initialize data
        # open report.json
        report_json_path = os.path.join(os.path.abspath(os.path.dirname(__file__)), 'report.json')
        with open(report_json_path) as f:
            self.data = json.load(f)

    def test_create_errorreport(self):
        """ create error report and assert it exists """
        self.client.post(f'{self.api_base_url}/errorreports/', self.data, format='json')
        self.assertEqual(ErrorReport.objects.count(), 1)

    def test_create_errorreport_with_invalid_harvester(self):
        """ create error report with invalid harvester """
        data = self.data.copy()
        data["data"]["sysmon_report"]["serial_number"] = 99
        response = self.client.post(f'{self.api_base_url}/errorreports/', data, format='json')
        self.assertEqual(response.status_code, 400)
        self.assertEqual(ErrorReport.objects.count(), 0)

    def test_update_errorreport(self):
        """ update error report and assert it exists """
        data = self.data.copy()
        report_time = make_aware(datetime.datetime.fromtimestamp(data["timestamp"]))

        ErrorReport.objects.create(
            creator=self.user, location=self.location,
            harvester=self.harvester, reportTime=report_time, report=data)

        # updating reportTime
        current_time = make_aware(datetime.datetime.now().replace(microsecond=0))
        new_timestamp = current_time.timestamp()
        data["timestamp"] = new_timestamp

        self.client.patch(f'{self.api_base_url}/errorreports/1/', data, format='json')
        self.assertEqual(ErrorReport.objects.get().reportTime, current_time)

    def test_update_errorreport_with_invalid_data(self):
        """ update error report with invalid data """
        data = self.data.copy()
        report_time = make_aware(datetime.datetime.fromtimestamp(data["timestamp"]))

        ErrorReport.objects.create(
            creator=self.user, location=self.location,
            harvester=self.harvester, reportTime=report_time, report=data)

        # updating harv_id
        response = self.client.patch(
            f'{self.api_base_url}/errorreports/1/',
            {data["data"]["sysmon_report"]["serial_number"]: "99"})
        self.assertEqual(response.status_code, 400)

    def test_delete_errorreport(self):
        """ delete error report and assert it does not exist """
        data = self.data.copy()
        report_time = make_aware(datetime.datetime.fromtimestamp(data["timestamp"]))

        ErrorReport.objects.create(
            creator=self.user, location=self.location,
            harvester=self.harvester, reportTime=report_time, report=data)

        self.client.delete(f'{self.api_base_url}/errorreports/1/')
        self.assertEqual(ErrorReport.objects.count(), 0)

    def test_get_all_errorreports(self):
        """ get all error reports """
        data = self.data
        report_time = make_aware(datetime.datetime.fromtimestamp(data["timestamp"]))

        ErrorReport.objects.create(
            creator=self.user, location=self.location,
            harvester=self.harvester, reportTime=report_time, report=data)

        current_time = make_aware(datetime.datetime.now().replace(microsecond=0))
        new_timestamp = current_time.timestamp()
        data["timestamp"] = new_timestamp
        ErrorReport.objects.create(
            creator=self.user, location=self.location,
            harvester=self.harvester, reportTime=report_time, report=data)

        response = self.client.get(f'{self.api_base_url}/errorreports/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["count"], 2)

    def test_get_errorreport_by_id(self):
        """ get error report by id """
        data = self.data
        report_time = make_aware(datetime.datetime.fromtimestamp(data["timestamp"]))

        ErrorReport.objects.create(
            creator=self.user, location=self.location,
            harvester=self.harvester, reportTime=report_time, report=data)

        response = self.client.get(f'{self.api_base_url}/errorreports/1/')
        self.assertEqual(response.status_code, 200)


