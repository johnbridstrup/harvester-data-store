from django.test import TestCase

from ..models import HarvesterVersionReport


class HarvesterVersionReportTestCase(TestCase):
    """Test HarvesterVersionReport model"""

    @classmethod
    def setUpTestData(cls):
        cls.clean = {
            "serial_number": "222",
            "master": {"version": 1.1, "dirty": {}},
            "robot.1": {"version": 1.1, "dirty": {}},
            "robot.2": {"version": 1.1, "dirty": {}},
            "robot.3": {"version": 1.1, "dirty": {}},
            "stereo.1": {"version": 1.1, "dirty": {}},
        }

        cls.dirty = {
            "serial_number": "222",
            "master": {"version": 1.1, "dirty": {"dirty_package": 1.2}},
            "robot.1": {"version": 1.1, "dirty": {}},
            "robot.2": {"version": 1.1, "dirty": {}},
            "robot.3": {"version": 1.1, "dirty": {}},
            "stereo.1": {"version": 1.1, "dirty": {}},
        }

    def test_is_dirty(self):
        """check if created fruit exits"""

        is_clean = HarvesterVersionReport.check_dirty(self.clean)
        is_dirty = HarvesterVersionReport.check_dirty(self.dirty)

        self.assertFalse(is_clean)
        self.assertTrue(is_dirty)

    def test_is_dirty_unexpected_keys(self):
        new_keys = {"new": "and", "unexpected": ["keys"], "plus": {"a": "dict"}}
        clean = self.clean.copy()
        dirty = self.dirty.copy()

        clean.update(new_keys)
        dirty.update(new_keys)

        is_clean = HarvesterVersionReport.check_dirty(clean)
        is_dirty = HarvesterVersionReport.check_dirty(dirty)

        self.assertFalse(is_clean)
        self.assertTrue(is_dirty)
