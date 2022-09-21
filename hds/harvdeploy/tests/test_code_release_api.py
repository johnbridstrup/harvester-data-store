from ..models import HarvesterCodeRelease
from common.tests import HDSAPITestBase


class ReleaseApiTestCase(HDSAPITestBase):
    def setUp(self):
        super().setUp()
        self.test_objects = self._setup_basic()

        self.release = {
            "version": 1.0,
            "master": {},
            "robot": {},
            "stereo": {}, 
            "project": self.test_objects["fruit"].name
        }

    def test_create_release(self):
        resp = self.client.post(
            f"{self.api_base_url}/release/",
            data=self.release,
            format='json'
        )

        self.assertEqual(resp.status_code, 201)

    def test_get_releases(self):
        self.client.post(
            f"{self.api_base_url}/release/",
            data=self.release,
            format='json'
        )

        resp = self.client.get(
            f"{self.api_base_url}/release/"
        )

        self.assertEqual(resp.status_code, 200)
    
    def test_get_release_by_id(self):
        self.client.post(
            f"{self.api_base_url}/release/",
            data=self.release,
            format='json'
        )

        resp = self.client.get(
            f"{self.api_base_url}/release/1/"
        )

        self.assertEqual(resp.status_code, 200)

    def test_delete_release(self):
        self.client.post(
            f"{self.api_base_url}/release/",
            data=self.release,
            format='json'
        )

        self.assertEqual(HarvesterCodeRelease.objects.count(), 1)

        resp = self.client.delete(
            f"{self.api_base_url}/release/1/"
        )

        self.assertEqual(resp.status_code, 204)
        self.assertEqual(HarvesterCodeRelease.objects.count(), 0)