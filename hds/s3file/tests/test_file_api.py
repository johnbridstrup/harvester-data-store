import tempfile, uuid
from urllib.parse import urljoin

from common.tests import HDSAPITestBase
from django.conf import settings
from errorreport.models import ErrorReport
from ..models import S3File, SessClip


class S3FileTestCase(HDSAPITestBase):
    def setUp(self):
        super().setUp()
        self.update_user_permissions_all(ErrorReport)
        self.update_user_permissions_all(S3File)

    def test_create_s3file(self):
        resp = self.create_s3file("test")
        self.assertEqual(resp.status_code, 201)
        self.assertEqual(resp.json()['data']['event']['UUID'], self.uuid)

        exp_url = urljoin(
            "http://testserver/",
            urljoin(settings.MEDIA_URL, f"{self.filetype}_{self.uuid}")
        )
        self.assertEqual(
            resp.json()['data']['file'],
            exp_url
        )

        # Assert initial tag applied
        data = resp.json()["data"]
        self.assertIn(S3File.__name__, data["event"]["tags"])

        # Assert filetype tag added
        resp = self.client.get(f"{self.api_base_url}/events/{data['event']['id']}/")
        data = resp.json()["data"]
        self.assertIn(self.filetype, data["tags"])

    def test_download_file(self):
        UUID = str(uuid.uuid1())
        os.makedirs(settings.MEDIA_ROOT, exist_ok=True)
        with tempfile.NamedTemporaryFile(dir=settings.MEDIA_ROOT, suffix=f"_{UUID}") as f:
            fname = f.name.split('/')[-1]
            resp = self.create_s3file(fname, has_uuid=True)
            
            url = resp.json()["data"]["file"]
            resp = self.client.get(url)
            self.assertEqual(
                resp.get('Content-Disposition'),
                f'inline; filename="{fname}"'
            )

    def test_link_to_report(self):
        file_resp = self.create_s3file("test")
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

    def test_create_sessclip(self):
        self.create_s3file("test", endpoint="sessclip")
        self.assertEqual(SessClip.objects.count(), 1)
