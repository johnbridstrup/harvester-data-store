from django.test import TestCase
from django.contrib.auth.models import User
from ..models import AFTException, AFTExceptionCode
from datetime import datetime
import pytz


class ExceptionTestBase(TestCase):
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
    

    @classmethod
    def setUpTestData(cls):
        """ create a fruit """
        creator = User.objects.create(id=1, username='test_user')
        for code in cls.CODES:
            AFTExceptionCode.objects.create(
                creator=creator, 
                code=code['code'], 
                name=code['name'],
                msg=code['msg'],
                cycle=code['cycle']
            )

class AFTExceptionCodeTestCase(ExceptionTestBase):
    def test_code_str(self):
        code0 = AFTExceptionCode.objects.get(code=0)
        self.assertEqual(
            str(code0), 
            f"Code {self.CODES[0]['code']}: {self.CODES[0]['name']}"
        )

        code1 = AFTExceptionCode.objects.get(code=0)
        self.assertEqual(
            str(code1), 
            f"Code {self.CODES[0]['code']}: {self.CODES[0]['name']}"
        )

    def test_code_msg(self):
        code = AFTExceptionCode.objects.get(code=0)
        self.assertEqual(code.msg, self.CODES[0]['msg'])


class AFTExceptionTestCase(ExceptionTestBase):
    SERVICE = 'TestService'
    NODE = 1
    TRACEBACK = "Test traceback"
    INFO = "Test value"
    TIMESTAMP = datetime.now().replace(tzinfo=pytz.utc)

    @classmethod
    def setUpTestData(cls):
        super().setUpTestData()
        code = AFTExceptionCode.objects.get(code=0)
        creator = User.objects.get(id=1)
        AFTException.objects.create(
            creator=creator,
            code=code,
            service=cls.SERVICE,
            node=cls.NODE,
            robot=cls.NODE,
            info=cls.INFO,
            traceback=cls.TRACEBACK,
            timestamp=cls.TIMESTAMP
        )

    def test_exceptions(self):
        exc = AFTException.objects.get(pk=1)

        self.assertEqual(exc.code.code, self.CODES[0]['code'])
        self.assertEqual(exc.service, self.SERVICE)
        self.assertEqual(exc.node, self.NODE)
        self.assertEqual(exc.robot, self.NODE)
        self.assertEqual(exc.info, self.INFO)
        self.assertEqual(exc.traceback, self.TRACEBACK)
        self.assertEqual(exc.timestamp, self.TIMESTAMP)
        