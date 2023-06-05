from common.tests import HDSAPITestBase

from .models import EmustatsReport


class EmustatsReportTestCase(HDSAPITestBase):
    def setUp(self):
        super().setUp()
        self.setup_basic()
        self.setup_urls()
        self.load_config_data()
        self.create_harvester_object(
            0,
            fruit=self.test_objects["fruit"],
            location=self.test_objects["location"],
            name="emu_harv",
            is_emu=True,
        )

    def test_basic(self):
        self.post_emustats_report()
        self.assertEqual(EmustatsReport.objects.count(), 1)