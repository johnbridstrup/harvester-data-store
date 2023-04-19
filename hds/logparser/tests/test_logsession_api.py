import tempfile
import zipfile
from unittest.mock import patch
from rest_framework import status

from .base import LogBaseTestCase


class LogSessionTestCase(LogBaseTestCase):
    """Test logsession api endpoints."""

    @patch("logparser.views.logsessionviews.perform_extraction.delay")
    def test_upload_zipfile(self, patched_extract):
        """Test uploading a zip file."""
        with tempfile.SpooledTemporaryFile() as tmp:
            with zipfile.ZipFile(tmp, 'w', zipfile.ZIP_DEFLATED) as archive:
                archive.writestr('20220208105000_005_02_logrec.log', self.line_content)
            tmp.seek(0)
            res = self.client.post(self.log_session_url, data = { 'zip_upload': tmp }, format="multipart")
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        patched_extract.assert_called_once()
        patched_extract.assert_called_with(res.data['id'])

    def test_retrieve_zipfiles(self):
        """Test retrieve uploaded zipfiles."""
        self.create_log_session()

        res = self.client.get(self.log_session_url)

        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data["count"], 1)

    def test_retrieve_detail_session(self):
        """Test retrieve log session by id"""
        log = self.create_log_session()

        res = self.client.get(self.log_session_detail(log.id))
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data["name"], log.name)
