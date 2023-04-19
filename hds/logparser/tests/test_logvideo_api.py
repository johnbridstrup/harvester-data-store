from rest_framework import status

from .base import LogBaseTestCase


class LogVideoTestCase(LogBaseTestCase):
    """Test logfiles api endpoints."""

    def test_retrieve_logvideos(self):
        """Test retrieve log videos successful."""
        self.create_log_video()

        res = self.client.get(self.log_video_url)

        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data["count"], 1)

    def test_retrieve_detail_log_video(self):
        """Test retrieve log video by id"""
        log = self.create_log_video()
        res = self.client.get(self.log_video_det_url(log.id))
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data["file_name"], log.file_name)

