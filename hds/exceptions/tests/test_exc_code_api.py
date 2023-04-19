from django.utils.timezone import datetime
from rest_framework import status

from common.tests import HDSAPITestBase

from ..models import (
    AFTExceptionCode,
    AFTExceptionCodeManifest,
)


class ExceptionTestBase(HDSAPITestBase):
    def setUp(self):
        super().setUp()

        self.CODE = 0
        self.CODES = [
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
        self.MANIFEST = {
            'version': '1.0.111',
            'manifest': self.CODES
        }

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


class AFTExceptionCodeManifestTestCase(ExceptionTestBase):
    def _send_manifest(self, manifest=None):
        manifest = manifest or self.MANIFEST
        r = self.client.post(
            f"{self.api_base_url}/exceptioncodemanifests/",
            data=self.MANIFEST,
            format="json",
        )
        return r

    def test_basic(self):
        r = self._send_manifest()

        self.assertEqual(r.status_code, status.HTTP_201_CREATED)
        self.assertEqual(AFTExceptionCodeManifest.objects.count(), 1)

    def test_create_codes(self):
        r = self._send_manifest()
        self.assertEqual(r.status_code, status.HTTP_201_CREATED)

        self.assertEqual(AFTExceptionCode.objects.count(), len(self.CODES))
        code_0 = self.CODES[0]
        code_1 = self.CODES[1]
        assert AFTExceptionCode.objects.get(code=code_0["code"])
        assert AFTExceptionCode.objects.get(code=code_1["code"])
        assert AFTExceptionCodeManifest.objects.get()

        aft_code_0 = AFTExceptionCode.objects.get(code=code_0["code"])
        manifest = AFTExceptionCodeManifest.objects.get()

        self.assertEqual(aft_code_0.name, code_0["name"])
        self.assertEqual(aft_code_0.msg, code_0["msg"])
        self.assertEqual(aft_code_0.team, code_0["team"])
        self.assertEqual(aft_code_0.cycle, code_0["cycle"])
        self.assertEqual(aft_code_0.manifest, manifest)

    def test_update_codes(self):
        self._send_manifest()
        new_codes = [
            {
                'code': 2,
                'name': 'NewExceptionTwo',
                'msg': 'test message',
                'team': 'aft',
                'cycle': False
            },
            {
                'code': 3,
                'name': 'NewExceptionThree',
                'msg': 'test message',
                'team': 'aft',
                'cycle': False
            },
        ]

        # Add new codes and modify an existing code
        original_0_msg = self.CODES[0]["msg"]
        self.CODES.extend(new_codes)
        self.MANIFEST["manifest"] = self.CODES
        self.MANIFEST["manifest"][0]["msg"] = "A NEW MESSAGE"
        r = self._send_manifest(manifest=self.MANIFEST)

        self.assertEqual(r.status_code, status.HTTP_201_CREATED)
        self.assertEqual(AFTExceptionCode.objects.count(), len(self.CODES))

        code_0 = self.CODES[0]
        code_3 = self.CODES[3]
        aft_code_0 = AFTExceptionCode.objects.get(code=code_0["code"])
        aft_code_3 = AFTExceptionCode.objects.get(code=code_3["code"])

        self.assertEqual(code_0["msg"], aft_code_0.msg)
        self.assertNotEqual(original_0_msg, aft_code_0.msg)
        self.assertAlmostEqual(datetime.now().timestamp(), aft_code_0.lastModified.timestamp(), 1)
        self.assertEqual(code_3["name"], aft_code_3.name)
        self.assertGreater(aft_code_3.lastModified, aft_code_3.created)

        # Code 0 will be updated, code 3 will be created
        self.assertIsNotNone(aft_code_0.modifiedBy)
        self.assertIsNone(aft_code_3.modifiedBy)
