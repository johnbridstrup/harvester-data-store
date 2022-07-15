from ..models import AFTException
from .test_exc_code_api import ExceptionTestBase
from datetime import datetime
import pytz


class AFTExceptionTest(ExceptionTestBase):
    def _send_exception(self, code_pk=1, service='testservice', node=1):
        ts = datetime.now().replace(tzinfo=pytz.utc)

        resp = self.client.post(
            f'{self.api_base_url}/exceptions/', 
            {
                'code': code_pk,
                'service': service,
                'node': node,
                'traceback': 'Test traceback',
                'timestamp': str(ts)
            }
        )

        return resp

    def test_create_exception(self):
        self._send_code()
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
        self.assertEqual(resp.data['code'], 1) # code is 0, pk is 1

    def test_update_code(self):
        self._send_code()
        self._send_exception()
        self.assertEqual(AFTException.objects.get().node, 1)
        self.client.patch(
            f'{self.api_base_url}/exceptions/1/', 
            {'node': 2}, 
            HTTP_ACCEPT='application/json'
        )
        self.assertEqual(AFTException.objects.count(), 1)
        self.assertEqual(AFTException.objects.get().node, 2)