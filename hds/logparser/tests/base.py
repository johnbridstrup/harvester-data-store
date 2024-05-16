"""
Base Test class for logparser api.
"""
import tempfile

from datetime import datetime
from django.test import TestCase
from django.utils.timezone import make_aware
from django.conf import settings

from common.tests import HDSAPITestBase
from event.models import Event
from s3file.models import S3File
from ..beat import get_dir_size, EXTRACTS_SIZE_GAUGE
from ..models import LogSession, LogFile, LogVideo


class LogBaseTestCase(HDSAPITestBase):
    """Test base class for logparser api"""

    def setUp(self):
        super().setUp()
        self.setup_basic()

        self.line_content = "[20220714T072500.013] [DEBUG] [autodrive.cand] -- Min Pos: 12492.610686305652, Cand: 4598"
        self.bucket_name = settings.MEDIA_ROOT
        self.zip_filename = "example.zip"
        self.log_filename = "20220208105000_005_02_logrec.log"

    def create_log_session(self):
        """create log session object"""
        return LogSession.objects.create(
            name="sessclip_h5r2_202202081050.zip",
            date_time=make_aware(datetime.now()),
            harv=self.test_objects["harvester"],
            creator=self.user,
        )

    def create_log_file(self):
        """create log file object"""
        return LogFile.objects.create(
            file_name="20220208105000_005_02_logrec.log",
            service="logrec",
            robot=2,
            log_session=self.create_log_session(),
            creator=self.user,
        )

    def create_log_video(self):
        """create log video object."""
        event = Event.objects.create(
            UUID=Event.generate_uuid(),
            tags=["test"],
            creator=self.user,
        )
        s3file = S3File.objects.create(
            key="test",
            file="test",
            filetype="test",
            creator=self.user,
            event=event,
        )
        return LogVideo.objects.create(
            file_name="20220208105000_005_02_color_1",
            robot=2,
            category="color",
            log_session=self.create_log_session(),
            creator=self.user,
            _video_avi=s3file,
        )


class BeatTestCase(TestCase):
    def setUp(self):
        super().setUp()
        self.temp_dir = tempfile.TemporaryDirectory()
        self.test_str = "hello"
        self.str_bytes = len(self.test_str.encode("utf-8"))

    def tearDown(self):
        self.temp_dir.cleanup()
        super().tearDown()

    def _write_str(self, file):
        with open(file, "w") as f:
            f.write(self.test_str)

    def test_dir_size(self):
        temp_dir = self.temp_dir.name
        temp_file = tempfile.NamedTemporaryFile(dir=temp_dir)
        self._write_str(temp_file.name)
        with open(temp_file.name, "w") as f:
            f.write(self.test_str)

        dir_bytes = get_dir_size(temp_dir)
        self.assertEqual(dir_bytes, self.str_bytes)

        print(EXTRACTS_SIZE_GAUGE._value.get())
