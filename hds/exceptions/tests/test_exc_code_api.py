from ..models import AFTExceptionCode
from common.tests import HDSAPITestBase


class ExceptionTestBase(HDSAPITestBase):
    CODE = 0
    CODES = [
        {
            'code': 0,
            'name': 'AFTBaseException',
            'msg': 'test message',
            'team': 'aft',
            'cycle': False
        },
        {
            'code': 1,
            'name': 'PickerBaseException',
            'msg': 'Picker message',
            'team': 'aft',
            'cycle': False
        }
    ]

    def _send_code(self, code=None, name='TestException'):
        if not code:
            code = self.CODE
        resp = self.client.post(
            f'{self.api_base_url}/exceptioncodes/', 
            self.CODES[code]
        )

        return resp


class AFTExceptionCodeTest(ExceptionTestBase):
    def test_create_code(self):
        resp = self._send_code()

        self.assertEqual(resp.status_code, 201)
        self.assertEqual(AFTExceptionCode.objects.count(), 1)
        self.assertEqual(AFTExceptionCode.objects.get().code, self.CODE)

    def test_create_duplicate_code(self):
        r1 = self._send_code()
        self.assertEqual(r1.status_code, 201)

        r2 = self._send_code()
        self.assertEqual(r2.status_code, 400)
        self.assertEqual(
            r2.json()['errors']['detail']['code'][0],
            'aft exception code with this code already exists.'
        )

    def test_delete_code(self):
        resp = self._send_code()
        self.assertEqual(resp.status_code, 201)

        self.client.delete(f'{self.api_base_url}/exceptioncodes/1/')
        self.assertEqual(AFTExceptionCode.objects.count(), 0)

    def test_get_all_codes(self):
        self._send_code(0)
        self._send_code(1, 'testexc2')

        resp = self.client.get(f'{self.api_base_url}/exceptioncodes/')
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.data["count"], 2)

    def test_get_code_by_id(self):
        self._send_code()
        resp = self.client.get(f'{self.api_base_url}/exceptioncodes/1/')
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.data['code'], self.CODE)

    def test_update_code(self):
        self._send_code()
        self.client.patch(
            f'{self.api_base_url}/exceptioncodes/1/', 
            {'name': 'NewName'}, 
            HTTP_ACCEPT='application/json'
        )
        self.assertEqual(AFTExceptionCode.objects.count(), 1)
        self.assertEqual(AFTExceptionCode.objects.get().name, 'NewName')