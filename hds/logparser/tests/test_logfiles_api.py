import os
from rest_framework import status
from .base import LogBaseTestCase
from ..serializers.logfileserializers import LogFileSerializer


class LogFileTestCase(LogBaseTestCase):
    """Test logfiles api endpoints."""

    def test_retrieve_logfiles(self):
        """Test retrieve logfiles successful."""
        self.create_log_file()

        res = self.client.get(self.log_file_url)

        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data["count"], 1)

    def test_retrieve_detail_log_file(self):
        """Test retrieve log file by id"""
        log = self.create_log_file()
        res = self.client.get(self.log_file_detail(log.id))
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data["file_name"], log.file_name)

    def test_logfile_extract(self):
        with open(self.logpath, 'r') as f:
            numlines = len(f.readlines())

        with open(self.logpath, 'r') as f:
            content = LogFileSerializer._extract_lines(f, 'test', 'test')

        self.assertEqual(numlines, len(content))

    def test_candump_extract(self):
        with open(self.canpath, 'r') as f:
            numlines = len(f.readlines())

        with open(self.canpath, 'r') as f:
            content = LogFileSerializer._extract_lines(f, 'test', 'test')

        self.assertEqual(numlines, len(content))

    def test_robot_service_extr(self):
        _, filename = os.path.split(self.logpath)
        _, _, robot_str, serv_str = filename.split('.')[0].split('_')

        service, robot = LogFileSerializer.extract_service_robot(filename)
        self.assertEqual(service, serv_str)
        self.assertEqual(robot, int(robot_str))
