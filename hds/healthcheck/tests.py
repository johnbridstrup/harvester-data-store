""" Test Fruits APIs """
from rest_framework.test import APITestCase
from rest_framework.test import APIClient
from rest_framework.authtoken.models import Token
from django.contrib.auth.models import User


class HealthcheckAPITest(APITestCase):
    """ Test Healthcheck APIs """
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create(username='test_user')
        self.token = Token.objects.create(user=self.user)
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + self.token.key)
        self.api_base_url = '/api/v1'

    def test_healthcheck_basic(self):
        response = self.client.get(f'{self.api_base_url}/healthcheck/')
        assert response.status_code == 200
        assert response.data['status'] == 'online'