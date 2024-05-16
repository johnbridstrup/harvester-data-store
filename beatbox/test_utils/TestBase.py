import os
import pytest
import unittest
from requests.status_codes import codes

from .Client import Client
from .Endpoints import Endpoints
from .exceptions import BeatboxError
from .S3Client import S3Client


class BaseTestCase(unittest.TestCase):
    BASE_TEST_PARAMS = {
        "is_beatbox_request": True,
    }

    def setUp(self):
        self.username = os.environ["TEST_USERNAME"]
        self.password = os.environ["TEST_PASSWORD"]
        self.base_url = os.environ["TEST_HOSTNAME"]

        self.client = Client(
            self.username,
            self.password,
            self.base_url,
            base_test_params=self.BASE_TEST_PARAMS,
        )

    def assertOk(self, response):
        self.assertEqual(
            response.status_code,
            codes.ok,
            f"Expected {codes.ok}, received {response.status_code}: {response.json()}",
        )

    def get_beatbox_harv_id(self, fruit):
        name = f"{fruit}-beatbox"
        filter_params = {"fruit__name": fruit, "name": name}

        r = self.client.get(Endpoints.HARVESTERS, params=filter_params)
        r.raise_for_status()

        resp_data = r.json()["data"]

        if resp_data["count"] != 1:
            raise BeatboxError(
                f"Expected 1 {name} harvester. Received {resp_data['count']}."
            )

        return resp_data["results"][0]["harv_id"]


class S3BaseTestCase(BaseTestCase):
    def setUp(self):
        BaseTestCase.setUp(self)
        self.s3client = S3Client()

        if not self.s3client.has_credentials():
            pytest.skip("S3 Credentials not found!")
