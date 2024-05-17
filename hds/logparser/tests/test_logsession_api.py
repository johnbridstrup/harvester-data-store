import tempfile
import zipfile
import uuid
import os
from unittest.mock import patch
from rest_framework import status
from django.core.files.uploadedfile import SimpleUploadedFile

from s3file.models import S3File, SessClip
from ..models import LogSession, LogFile
from .base import LogBaseTestCase


class LogSessionTestCase(LogBaseTestCase):
    """Test logsession api endpoints."""

    def _create_zip_file(self, tag_uuid=False, empty_content=False):
        if tag_uuid:
            root, ext = os.path.splitext(self.zip_filename)
            self.zip_filename = f"{root}_{uuid.uuid4()}{ext}"
        try:
            with tempfile.TemporaryDirectory(dir=self.bucket_name) as temp_dir:
                log_file_path = os.path.join(temp_dir, self.log_filename)
                with open(log_file_path, "w") as log_file:
                    if empty_content:
                        log_file.write("")
                    else:
                        log_file.write(self.line_content)

                zip_path = os.path.join(self.bucket_name, self.zip_filename)
                with zipfile.ZipFile(
                    zip_path, "w", zipfile.ZIP_DEFLATED
                ) as zip_file:
                    zip_file.write(
                        log_file_path, os.path.basename(log_file_path)
                    )

            return self.zip_filename
        except Exception as e:
            print(f"An error occurred: {e}")
            return None

    def _rm_file(self, full_path):
        if os.path.isfile(full_path):
            os.unlink(full_path)

    @patch("logparser.views.logsessionviews.async_upload_zip_file.delay")
    def test_upload_zipfile(self, patched_upload):
        """Test uploading a zip file to create logsession & extract content."""
        zipname = self._create_zip_file()
        self.assertIsNotNone(zipname)
        zippath = os.path.join(self.bucket_name, zipname)
        with open(zippath, "rb") as thezip:
            file_content = thezip.read()
        sample_file = SimpleUploadedFile(zipname, file_content)
        res = self.client.post(
            self.log_session_url,
            data={"zip_upload": sample_file},
            format="multipart",
        )
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        logsession = LogSession.objects.get()
        self.assertEqual(logsession.name, zipname)
        self.assertEqual(logsession.logfile.count(), 1)
        patched_upload.assert_called_once()
        patched_upload.assert_called_with(res.data["id"])

        self._rm_file(zippath)

    def test_retrieve_zipfiles(self):
        """Test retrieve uploaded zipfiles."""
        self.create_log_session()

        res = self.client.get(self.log_session_url)

        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data["count"], 1)

    def test_retrieve_detail_session(self):
        """Test retrieve log session by id"""
        log = self.create_log_session()

        res = self.client.get(self.log_session_det_url(log.id))
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data["name"], log.name)

    def test_full_pipeline_sessclip_extraction(self):
        """
        Test full sessclip pipeline from POST method -> download
        -> extraction -> logsession creation without tag uuid in
        zip filename
        """
        zipname = self._create_zip_file()
        self.assertIsNotNone(zipname)
        data = self.create_s3event(zipname, tag_uuid=True)[0]
        res = self.client.post(self.sesscl_url, data=data)
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        s3file = S3File.objects.get()
        sess = SessClip.objects.get()
        logsession = LogSession.objects.get()
        self.assertEqual(s3file.key, zipname)
        self.assertEqual(logsession._zip_file, sess)
        self.assertEqual(sess.file, s3file)
        self.assertEqual(logsession.logfile.count(), 1)

        self._rm_file(os.path.join(self.bucket_name, zipname))

    def test_full_sessclip_pipeline_tag_uuid(self):
        """
        Test full sessclip pipeline from POST method -> download
        -> extraction -> logsession creation with tag uuid in
        zip filename
        """
        zipname = self._create_zip_file(tag_uuid=True)
        self.assertIsNotNone(zipname)
        data = self.create_s3event(zipname, tag_uuid=True)[0]
        res = self.client.post(self.sesscl_url, data=data)
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        s3file = S3File.objects.get()
        sess = SessClip.objects.get()
        logsession = LogSession.objects.get()
        self.assertEqual(s3file.key, zipname)
        self.assertEqual(logsession._zip_file, sess)
        self.assertEqual(sess.file, s3file)
        self.assertEqual(logsession.logfile.count(), 1)

        self._rm_file(os.path.join(self.bucket_name, zipname))

    def test_return_on_empty_logfiles(self):
        """
        No need to save logfiles with empty content - does not look good
        on presentation. These error logs occurs during initial boot
        when the robot computers are not yet up!
        """
        zipname = self._create_zip_file(empty_content=True)
        self.assertIsNotNone(zipname)
        data = self.create_s3event(zipname, tag_uuid=True)[0]
        res = self.client.post(self.sesscl_url, data=data)
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        logsession = LogSession.objects.get()
        self.assertEqual(logsession.logfile.count(), 0)
        with self.assertRaises(LogFile.DoesNotExist):
            LogFile.objects.get()

        self._rm_file(os.path.join(self.bucket_name, zipname))
