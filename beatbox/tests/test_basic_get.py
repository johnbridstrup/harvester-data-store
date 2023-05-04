from test_utils.Endpoints import Endpoints
from test_utils.TestBase import BaseTestCase


class TestBasic(BaseTestCase):
    def _test_get(self, endpoint):
        r = self.client.get(endpoint, params=self.BASE_TEST_PARAMS)
        self.assertOk(r)
    
    def test_get_errorreports(self):
        self._test_get(Endpoints.ERROR)

    def test_get_exceptions(self):
        self._test_get(Endpoints.EXCEPTIONS)

    def test_get_harvesters(self):
        self._test_get(Endpoints.HARVESTERS)
