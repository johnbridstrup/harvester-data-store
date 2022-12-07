"""
Base Test class for logparser api.
"""
from datetime import datetime
from django.utils.timezone import make_aware
from django.urls import reverse
from common.tests import HDSAPITestBase
from ..models import LogSession, LogFile, LogVideo


class LogBaseTestCase(HDSAPITestBase):
    """Test base class for logparser api"""

    def setUp(self):
        super().setUp()

        self.update_user_permissions_all(LogSession)
        self.update_user_permissions_all(LogFile)

        self.log_session_url = reverse("logsession-list")
        self.log_session_detail = lambda _id : reverse(
          "logsession-detail", args=[_id]
        )
        self.log_file_url = reverse("logfile-list")
        self.log_file_detail = lambda _id : reverse(
          "logfile-detail", args=[_id]
        )
        self.log_video_url = reverse("logvideo-list")
        self.log_video_detail = lambda _id: reverse(
          "logvideo-detail",args=[_id]
        )
        self.test_objects = self._setup_basic()

        self.line_content = "[20220714T072500.013] [DEBUG] [autodrive.cand] -- Min Pos: 12492.610686305652, Cand: 4598"

    def create_log_session(self):
        """create log session object"""
        return LogSession.objects.create(
          name="sessclip_h5r2_202202081050.zip",
          date_time=make_aware(datetime.now()),
          harv=self.test_objects["harvester"],
          creator=self.user
        )

    def create_log_file(self):
        """create log file object"""
        return LogFile.objects.create(
          file_name="20220208105000_005_02_logrec.log",
          service="logrec",
          robot=2,
          log_session=self.create_log_session(),
          creator=self.user
        )

    def create_log_video(self):
        """create log video object."""
        return LogVideo.objects.create(
          file_name="20220208105000_005_02_color_1",
          robot=2,
          category="color",
          log_session=self.create_log_session(),
          creator=self.user
        )
