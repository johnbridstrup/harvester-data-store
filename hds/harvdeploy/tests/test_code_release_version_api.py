from ..models import HarvesterCodeRelease
from common.tests import HDSAPITestBase

from rest_framework import status


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

    ## HarvesterCodeRelease

    def create_release(self, release=None):
        if release is None:
            release = self.release
        resp = self.client.post(
            f"{self.api_base_url}/release/",
            data=release,
            format='json'
        )

        return resp, release

    def test_create_release(self):
        resp, _ = self.create_release()

        self.assertEqual(resp.status_code, 201)

    def test_get_releases(self):
        self.create_release()

        resp = self.client.get(
            f"{self.api_base_url}/release/"
        )

        self.assertEqual(resp.status_code, 200)
    
    def test_get_release_by_id(self):
        self.create_release()

        resp = self.client.get(
            f"{self.api_base_url}/release/1/"
        )

        self.assertEqual(resp.status_code, 200)

    def test_delete_release(self):
        self.create_release()

        self.assertEqual(HarvesterCodeRelease.objects.count(), 1)

        resp = self.client.delete(
            f"{self.api_base_url}/release/1/"
        )

        self.assertEqual(resp.status_code, 204)
        self.assertEqual(HarvesterCodeRelease.objects.count(), 0)

    def test_update_harvester(self):
        self.create_release()
        resp = self.client.patch(f"{self.api_base_url}/harvesters/1/", data={"release": 1})

        self.assertEqual(resp.status_code, status.HTTP_200_OK)

        data = resp.json()["data"]
        self.assertEqual(data["release"]["version"], str(self.release["version"]))