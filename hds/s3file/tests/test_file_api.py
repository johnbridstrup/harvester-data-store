from common.tests import HDSAPITestBase
from errorreport.models import ErrorReport
from ..models import S3File
from ..serializers import S3FileSerializer
import os
import json


class S3FileTestCase(HDSAPITestBase):
    def setUp(self):
        super().setUp()
        self.update_user_permissions_all(ErrorReport)
        self.update_user_permissions_all(S3File)
        self._setup_s3file()

    def test_create_s3file(self):
        resp = self.create_s3file()
        
        self.assertEqual(resp.status_code, 201)
        self.assertEqual(resp.json()['data']['event']['UUID'], self.uuid)

        # Assert initial tag applied
        data = resp.json()["data"]
        self.assertIn(S3File.__name__, data["event"]["tags"])

        # Assert filetype tag added
        resp = self.client.get(f"{self.api_base_url}/events/{data['event']['id']}/")
        data = resp.json()["data"]
        self.assertIn(self.filetype, data["tags"])

    def test_link_to_report(self):
        file_resp = self.create_s3file()
        self._setup_basic()
        self._load_report_data()
        self.data['data']['uuid'] = self.uuid
        rep_resp = self._post_error_report(load=False)

        self.assertEqual(
            file_resp.json()['data']['event']['UUID'],
            rep_resp['data']['event']['UUID']
        )

        # Assert all tags are there
        event_data = rep_resp["data"]["event"]
        expect_tags = [S3File.__name__, self.filetype, ErrorReport.__name__]
        for tag in expect_tags:
            self.assertIn(tag, event_data["tags"])
