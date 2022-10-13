from common.tests import HDSAPITestBase
from errorreport.models import ErrorReport
from ..models import S3File
from ..serializers import S3FileSerializer
import os
import json


class S3FileTestCase(HDSAPITestBase):
    def setUp(self):
        event_json_path = os.path.join(os.path.abspath(os.path.dirname(__file__)), 'test_file_event.json')
        with open(event_json_path, 'r') as f:
            self.s3event = json.load(f)
            # SQS client sends the event as a string in the 'Body' key
            self.s3event = {'Body': json.dumps(self.s3event)}

        self.bucket, self.key = S3FileSerializer.get_bucket_key(self.s3event)
        self.filetype, self.uuid = S3FileSerializer.get_filetype_uuid(self.key)

        super().setUp()
        self.update_user_permissions_all(ErrorReport)
        self.update_user_permissions_all(S3File)

    def test_create_s3file(self):
        resp = self.client.post(
            f"{self.api_base_url}/s3files/",
            data=self.s3event,
            format='json'
        )
        
        self.assertEqual(resp.status_code, 201)
        self.assertEqual(resp.json()['data']['event']['UUID'], self.uuid)

    def test_link_to_report(self):
        file_resp = self.client.post(
            f"{self.api_base_url}/s3files/",
            data=self.s3event,
            format='json'
        )
        self._setup_basic()
        self._load_report_data()
        self.data['data']['uuid'] = self.uuid
        rep_resp = self._post_error_report(load=False)

        self.assertEqual(
            file_resp.json()['data']['event']['UUID'],
            rep_resp['data']['event']['UUID']
        )
