import json, os
from rest_framework.test import APITestCase
from rest_framework.test import APIClient
from rest_framework.authtoken.models import Token
from django.contrib.auth.models import User
from hds.urls import urlpatterns
from exceptions.models import AFTExceptionCode
from harvester.models import Fruit, Harvester
from location.models import Distributor, Location
from .utils import build_frontend_url

import logging
# Disable logging in unit tests
logging.disable(level=logging.CRITICAL) 


def get_endpoint(urlpattern):
    return urlpattern.pattern._route

def compare_patterns(keys, urls):
    ignore = ['admin/', 'api/v1/openapi', 'api/v1/users/', 'prometheus/']
    return all(['/' + u in keys if u not in ignore else True for u in urls])


class HDSAPITestBase(APITestCase):

    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create(username='test_user')
        self.token = Token.objects.create(user=self.user)
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + self.token.key)
        self.api_base_url = '/api/v1'

    def _setup_basic(self):
        test_objects = {}
        test_objects["fruit"] = Fruit.objects.create(name='strawberry', creator=self.user)
        test_objects["distributor"] = Distributor.objects.create(name='test_distrib', creator=self.user)
        test_objects["location"] = Location.objects.create(**{
            "distributor": test_objects["distributor"],
            "ranch": "Ranch A",
            "country": "US",
            "region": "California",
            'creator': self.user
        })
        test_objects["harvester"] = Harvester.objects.create(**{
            'harv_id': 11,
            'fruit': test_objects["fruit"],
            'location': test_objects["location"],
            'name': 'Harvester 1',
            'creator': self.user
        })
        test_objects["code"] = AFTExceptionCode.objects.create(**{
            'code': 0,
            'name': 'AFTBaseException',
            'msg': 'test message',
            'team': 'aft',
            'cycle': False,
            'creator': self.user
        })

        return test_objects

    def _post_error_report(self):
        report_path = os.path.join(os.path.abspath(os.path.dirname(__file__)), 'test_data/report.json')
        with open(report_path, 'rb') as f:
            data = json.load(f)
        resp = self.client.post(f'{self.api_base_url}/errorreports/', data, format='json')
        return resp.json()

    def test_frontend_url(self):
        url = build_frontend_url('test_endpoint', 1)

        self.assertEqual(url, "http://localhost:3000/test_endpoint/1/")

class OpenApiTest(HDSAPITestBase):
    """ Test OpenAPI Schema Generation """

    def test_get_schema(self):
        """ create fruit and assert it exists """
        resp = self.client.get(f'{self.api_base_url}/openapi')
        data = resp.data
        keys = list(data['paths'].keys())
        endpoints = [get_endpoint(p) for p in urlpatterns]

        assert compare_patterns(keys, endpoints)
        
        assert data['info']['title'] == "Harvester Data Store"


class PrometheusTest(HDSAPITestBase):
    """ Test Prometheus Endpoint """

    def test_get_prometheus(self):
        """ create fruit and assert it exists """
        resp = self.client.get('/metrics')
        assert resp.status_code == 200
