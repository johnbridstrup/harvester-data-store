import os
import pytest
import unittest
from requests.status_codes import codes

from .Client import Client


class BaseTestCase(unittest.TestCase):
    def setUp(self):
        self.username = os.environ["TEST_USERNAME"]
        self.password = os.environ["TEST_PASSWORD"]
        self.base_url = os.environ["TEST_HOSTNAME"]

        self.client = Client(self.username, self.password, self.base_url)
    
    def assertOk(self, response):
        self.assertEqual(
            response.status_code, 
            codes.ok, 
            f"Expected {codes.ok}, received {response.status_code}: {response.json()}")