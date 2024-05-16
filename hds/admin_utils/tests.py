from common.tests import HDSAPITestBase
from errorreport.models import ErrorReport
from event.models import Event, PickSession
from exceptions.models import AFTException

from .tasks import clean_beatbox


class AdminUtilsTestCase(HDSAPITestBase):
    def setUp(self):
        super().setUp()
        self.setup_basic()

    def test_clean_beatbox(self):
        self.create_harvester_object(
            10000, name="sb-beatbox", fruit=self.test_objects["fruit"]
        )
        self.load_error_report()
        self.data["serial_number"] = 10000

        self.post_error_report(load=False)
        self.assertEqual(ErrorReport.objects.count(), 1)
        self.assertEqual(Event.objects.count(), 1)
        self.assertEqual(PickSession.objects.count(), 1)
        self.assertGreater(AFTException.objects.count(), 0)

        clean_beatbox()
        self.assertEqual(ErrorReport.objects.count(), 0)
        self.assertEqual(Event.objects.count(), 0)
        self.assertEqual(PickSession.objects.count(), 0)
        self.assertEqual(AFTException.objects.count(), 0)
