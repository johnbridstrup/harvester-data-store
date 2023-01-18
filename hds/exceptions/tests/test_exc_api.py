from ..models import AFTException
from .test_exc_code_api import ExceptionTestBase
from datetime import datetime
import pytz


class AFTExceptionTest(ExceptionTestBase):
    def setUp(self):
        super().setUp()
        self.test_objects = self._setup_basic()
    
    def _send_exception(self, code=0, service='testservice', node=1):
        ts = datetime.now().replace(tzinfo=pytz.utc)

        resp = self.client.post(
            f'{self.api_base_url}/exceptions/', 
            {
                'code': code,
                'service': service,
                'node': node,
                'robot': node,
                'value': 'Test value',
                'traceback': 'Test traceback',
                'timestamp': str(ts),
            }
        )

        return resp

    def test_create_exception(self):
        resp=self._send_code()
        resp = self._send_exception()
    
        self.assertEqual(resp.status_code, 201)
        self.assertEqual(AFTException.objects.count(), 1)
        self.assertEqual(AFTException.objects.get().code.code, self.CODE)


    def test_delete_exception(self):
        self._send_code()
        resp = self._send_exception()
        self.assertEqual(resp.status_code, 201)

        self.client.delete(f'{self.api_base_url}/exceptions/1/')
        self.assertEqual(AFTException.objects.count(), 0)

    def test_get_all_exceptions(self):
        self._send_code(0)
        self._send_exception()
        self._send_exception(service="otherservice")

        resp = self.client.get(f'{self.api_base_url}/exceptions/')
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.data["count"], 2)

    def test_get_exception_by_id(self):
        self._send_code()
        self._send_exception()
        resp = self.client.get(f'{self.api_base_url}/exceptions/1/')
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.data['code']['code'], 0)

    def test_get_primary(self):
        self._post_error_report()
        self.assertEqual(AFTException.objects.count(), 3)
        resp = self.client.get(f'{self.api_base_url}/exceptions/?primary=True')
        self.assertEqual(resp.json()['data']['count'], 1)

    def test_get_date_range(self):
        self._post_error_report()
        resp = self.client.get(f'{self.api_base_url}/exceptions/?datetime_range=20220101T000100.0,20220430T235955.0')
        self.assertEqual(resp.json()['data']['count'], 1)
    
    def test_get_harv_ids(self):
        self._post_error_report()
        self.create_harvester_object(
            10,
            name="harv10" ,
            fruit=self.test_objects["fruit"], 
            location=self.test_objects["location"], 
            creator=self.user
        )
        self.data['serial_number'] = "010"
        self._post_error_report(load=False)
        self.create_harvester_object(
            9,
            name="harv9", 
            fruit=self.test_objects["fruit"], 
            location=self.test_objects["location"], 
            creator=self.user
        )
        self.data['serial_number'] = "009"
        self._post_error_report(load=False)

        resp = self.client.get(f'{self.api_base_url}/exceptions/?harv_ids=9,10')
        self.assertEqual(resp.json()['data']['count'], 6)
