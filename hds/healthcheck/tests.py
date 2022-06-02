""" Test healthcheck API """
from common.tests import HDSAPITestBase


class HealthcheckAPITest(HDSAPITestBase):
    """ Test Healthcheck APIs """
    def test_healthcheck_basic(self):
        response = self.client.get(f'{self.api_base_url}/healthcheck/')
        assert response.status_code == 200
        assert response.data['status'] == 'online'