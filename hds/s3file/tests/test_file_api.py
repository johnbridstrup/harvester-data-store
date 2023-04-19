import os, tempfile, uuid
from contextlib import contextmanager
from urllib.parse import urljoin
from django.urls import reverse

from common.tests import HDSAPITestBase
from django.conf import settings
from django.core.files.uploadedfile import InMemoryUploadedFile
from errorreport.models import ErrorReport
from event.models import Event
from event.serializers import EventSerializer
from ..models import S3File, SessClip
from ..serializers import DirectUploadSerializer

@contextmanager
def remove_after(fp):
    try:
        yield
    finally:
        os.remove(fp)


class S3FileTestCase(HDSAPITestBase):
    def setUp(self):
        super().setUp()
        self.s3file_detail_url = lambda _id: reverse(
            "s3file-detail",
            args=[_id]
        )

    @staticmethod
    def _rm_file(filename):
        full_path = os.path.join(settings.MEDIA_ROOT, "uploads", filename)
        os.remove(full_path)

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

    def test_upload_file_ser(self):
        with tempfile.NamedTemporaryFile() as tf:
            with open(tf.name, 'rb') as f:
                file = InMemoryUploadedFile(
                    file=f,
                    field_name="test",
                    name="test",
                    content_type="test/test",
                    size=8,
                    charset="UTF-8",
                )
                fname = f.name.split('/')[-1]
                data = {
                    "key": fname,
                    "file": file,
                    "filetype": "test",
                    "creator": self.user.id,
                }
                full_path = os.path.join(settings.MEDIA_ROOT, "uploads", "test")
                with remove_after(full_path):
                    file_upload = DirectUploadSerializer(data=data)
                    file_upload.is_valid()
                    file_upload.save()
                    self.assertEqual(S3File.objects.count(), 1)

    def test_file_ser_no_key(self):
        with tempfile.NamedTemporaryFile() as tf:
            with open(tf.name, 'rb') as f:
                file = InMemoryUploadedFile(
                    file=f,
                    field_name="test",
                    name="test",
                    content_type="test/test",
                    size=8,
                    charset="UTF-8",
                )
                data = {
                    "file": file,
                    "filetype": "test",
                    "creator": self.user.id,
                }
                full_path = os.path.join(settings.MEDIA_ROOT, "uploads", "test")
                key = os.path.join("uploads", "test")
                with remove_after(full_path):
                    file_upload = DirectUploadSerializer(data=data)
                    file_upload.is_valid()
                    inst = file_upload.save()
                    self.assertEqual(inst.file.path, full_path)
                    self.assertEqual(inst.key, key)
                    self.assertEqual(inst.file.name, key)

    def test_link_to_report(self):
        file_resp = self.create_s3file("test")
        self._setup_basic()
        self.load_error_report()
        self.data['uuid'] = self.uuid
        rep_resp = self.post_error_report(load=False)

        self.assertEqual(
            file_resp.json()['data']['event']['UUID'],
            rep_resp['data']['event']['UUID']
        )

        # Assert all tags are there
        event_data = rep_resp["data"]["event"]
        expect_tags = [S3File.__name__, self.filetype, ErrorReport.__name__]
        for tag in expect_tags:
            self.assertIn(tag, event_data["tags"])

    def test_link_aux_file_to_report(self):
        self._setup_basic()
        PRIM_UUID = "primar"
        SEC_UUID = "second"

        prim_key = f"file_{PRIM_UUID}.txt"
        sec_key = f"file_{SEC_UUID}.txt"

        self.create_s3file(prim_key, has_uuid=True)
        self.create_s3file(sec_key, has_uuid=True)

        self.load_error_report()
        self.data['uuid'] = PRIM_UUID
        self.data["aux_uuids"] = [SEC_UUID]
        self.post_error_report(load=False)

        report = ErrorReport.objects.get(id=1)
        event_data = EventSerializer(instance=report.event).data
        self.assertEqual(len(event_data["related_files"]), 2)

    def test_create_sessclip(self):
        self.create_s3file("test", endpoint="sessclip")
        self.assertEqual(SessClip.objects.count(), 1)

    def test_delete_file(self):
        with tempfile.NamedTemporaryFile() as tf:
            with open(tf.name, 'rb') as f:
                file = InMemoryUploadedFile(
                    file=f,
                    field_name="test",
                    name="test",
                    content_type="test/test",
                    size=8,
                    charset="UTF-8",
                )
                fname = f.name.split('/')[-1]
                data = {
                    "key": fname,
                    "file": file,
                    "filetype": "test",
                    "creator": self.user.id,
                }
                file_upload = DirectUploadSerializer(data=data)
                file_upload.is_valid(raise_exception=True)
                inst = file_upload.save()
                self.assertFalse(inst.deleted)
                self.client.delete(self.s3file_detail_url(inst.id)) #file.delete() cleans up fs
                inst.refresh_from_db()
                self.assertTrue(inst.deleted)
                with self.assertRaises(ValueError):
                    inst.file.url
