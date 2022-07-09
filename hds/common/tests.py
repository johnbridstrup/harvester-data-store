from rest_framework.test import APITestCase
from rest_framework.test import APIClient
from rest_framework.authtoken.models import Token

from django.contrib.auth.models import User

from hds.urls import urlpatterns

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
