from test_utils.Endpoints import Endpoints
from test_utils.TestBase import BaseTestCase


class TestBasic(BaseTestCase):
    
    def test_get_errorreports(self):
        r = self.client.get(Endpoints.ERROR, params=self.BASE_TEST_PARAMS)
        self.assertOk(r)

    def test_get_exceptions(self):
        r = self.client.get(Endpoints.EXCEPTIONS, params=self.BASE_TEST_PARAMS)
        self.assertOk(r)