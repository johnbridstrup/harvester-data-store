import time
from dateutil import parser as dateparser
from urllib.parse import urljoin

from rest_framework import status

from common.tests import HDSAPITestBase
from ..models import HarvesterCodeRelease, HarvesterVersionReport


class ReleaseApiTestCase(HDSAPITestBase):
    def setUp(self):
        super().setUp()
        self.setup_basic()

        self.release = {
            "version": 1.0,
            "master": {},
            "robot": {},
            "stereo": {},
            "project": self.test_objects["fruit"].name,
        }

        self.versions = {
            "type": "version",
            "serial_number": self.test_objects["harvester"].harv_id,
            "data": {
                "master": {"version": 1.0, "dirty": {}, "unexpected": {}},
                "robot01": {"version": 1.0, "dirty": {}, "unexpected": {}},
                "stereo01": {"version": 1.0, "dirty": {}, "unexpected": {}},
                "robot02": {"version": 1.0, "dirty": {}, "unexpected": {}},
                "stereo02": {"version": 1.0, "dirty": {}, "unexpected": {}},
            },
        }

        self.version2 = {
            "type": "version",
            "serial_number": self.test_objects["harvester"].harv_id,
            "data": {
                "master": {"version": 2.0, "dirty": {}, "unexpected": {}},
                "robot01": {"version": 2.0, "dirty": {}, "unexpected": {}},
                "stereo01": {"version": 2.0, "dirty": {}, "unexpected": {}},
                "robot02": {"version": 2.0, "dirty": {}, "unexpected": {}},
                "stereo02": {"version": 2.0, "dirty": {}, "unexpected": {}},
            },
        }

    ## HarvesterCodeRelease

    def create_release(self, release=None):
        if release is None:
            release = self.release
        resp = self.client.post(self.release_url, data=release, format="json")

        return resp, release

    def test_create_release(self):
        resp, _ = self.create_release()

        self.assertEqual(resp.status_code, 201)

    def test_get_releases(self):
        self.create_release()

        resp = self.client.get(self.release_url)

        self.assertEqual(resp.status_code, 200)

    def test_get_release_by_id(self):
        self.create_release()

        resp = self.client.get(self.release_det_url(1))

        self.assertEqual(resp.status_code, 200)

    def test_get_releases_by_fruit(self):
        self.create_release()

        fruit2 = "apple"
        fruit2_obj = self.create_fruit_object(fruit2)
        release2 = self.release
        release2["project"] = fruit2
        release2["version"] = 1.111
        self.create_release(release2)

        # assert both are there
        resp = self.client.get(self.release_url)
        data = resp.json()["data"]
        self.assertEqual(data["count"], 2)

        # assert only apple release retrieved
        resp = self.client.get(f"{self.release_url}?fruit=apple")
        data = resp.json()["data"]
        self.assertEqual(data["count"], 1)
        self.assertEqual(data["results"][0]["fruit"], fruit2_obj.id)

    def test_delete_release(self):
        self.create_release()

        self.assertEqual(HarvesterCodeRelease.objects.count(), 1)

        resp = self.client.delete(self.release_det_url(1))

        self.assertEqual(resp.status_code, 204)
        self.assertEqual(HarvesterCodeRelease.objects.count(), 0)

    def test_update_harvester(self):
        self.create_release()
        resp = self.client.patch(self.harv_det_url(1), data={"release": 1})
        self.assertEqual(resp.status_code, status.HTTP_200_OK)

        resp = self.client.get(self.harv_det_url(1))
        self.assertEqual(resp.status_code, status.HTTP_200_OK)

        data = resp.json()["data"]
        self.assertEqual(data["release"]["version"], str(self.release["version"]))

    ## HarvesterVersionReport

    def create_version(self, versions=None, ts=None):
        if versions is None:
            versions = self.versions
        if ts is None:
            versions["timestamp"] = time.time()
        else:
            versions["timestamp"] = ts

        resp = self.client.post(self.version_url, data=versions, format="json")

        return resp, versions

    def test_create_version(self):
        self.assertEqual(HarvesterVersionReport.objects.count(), 0)

        self.create_version()
        self.assertEqual(HarvesterVersionReport.objects.count(), 1)

        obj = HarvesterVersionReport.objects.get()
        self.assertFalse(obj.is_dirty)

    def test_create_dirty(self):
        dirty_versions = self.versions.copy()
        dirty_versions["data"]["master"]["dirty"]["bad_package"] = 1.11
        self.create_version(dirty_versions)

        obj = HarvesterVersionReport.objects.get()
        self.assertTrue(obj.is_dirty)

    def test_create_unexpected(self):
        unexpected_versions = self.versions.copy()
        unexpected_versions["data"]["master"]["unexpected"]["unexpected_package"] = 1.11
        self.create_version(unexpected_versions)

        obj = HarvesterVersionReport.objects.get()
        self.assertTrue(obj.has_unexpected)

    def test_create_version_changed(self):
        self.create_version()
        self.assertEqual(HarvesterVersionReport.objects.count(), 1)

        # A new version is added to the history.
        self.create_version(versions=self.version2)
        self.assertEqual(HarvesterVersionReport.objects.count(), 2)

    def test_create_version_unchanged(self):
        r1, _ = self.create_version()
        self.assertEqual(HarvesterVersionReport.objects.count(), 1)
        t1 = dateparser.parse(r1.json()["data"]["lastModified"])

        # The harvester is reporting it's version unchanged.
        r2, _ = self.create_version()
        self.assertEqual(HarvesterVersionReport.objects.count(), 1)
        t2 = dateparser.parse(r2.json()["data"]["lastModified"])

        # assert lastModified updates
        self.assertTrue(t2 > t1)

    def test_version_unchanged_with_dirty(self):
        self.create_version()
        self.assertEqual(HarvesterVersionReport.objects.count(), 1)

        # Someone has changed a package version.
        self.versions["data"]["robot01"]["dirty"]["reverted-package"] = "bad-version"
        self.create_version()
        self.assertEqual(HarvesterVersionReport.objects.count(), 2)

    def test_create_reverted_version(self):
        # We may revert to an earlier release. This should be reflected
        # in the history.
        self.create_version()
        self.assertEqual(HarvesterVersionReport.objects.count(), 1)

        self.create_version(versions=self.version2)
        self.assertEqual(HarvesterVersionReport.objects.count(), 2)

        # We have reverted versions, which should be tracked.
        self.create_version()
        self.assertEqual(HarvesterVersionReport.objects.count(), 3)

    def test_uploaded_out_of_order(self):
        # We may upload version files out of order. If a new version
        # is uploaded before an old version, this should be accounted
        # for.
        t1 = time.time()
        t2 = t1 + 10
        t3 = t1 + 20

        self.create_version(ts=t1)
        self.assertEqual(HarvesterVersionReport.objects.count(), 1)

        self.create_version(self.version2, ts=t3)
        self.assertEqual(HarvesterVersionReport.objects.count(), 2)

        self.create_version(ts=t2)
        self.assertEqual(HarvesterVersionReport.objects.count(), 2)

    def test_get_versions(self):
        self.create_version()
        self.create_version(versions=self.version2)

        resp = self.client.get(self.version_url)
        self.assertEqual(resp.json()["data"]["count"], 2)

    def test_get_version_by_id(self):
        self.create_version()
        self.create_version(versions=self.version2)

        resp = self.client.get(self.version_det_url(2))
        data = resp.json()["data"]

        self.assertDictEqual(data["report"], self.version2)

    def test_version_history_by_harv_id(self):
        harv = self.create_harvester_object(
            15,
            self.test_objects["fruit"],
            self.test_objects["location"],
            "new_harv",
            self.user,
        )
        resp, _ = self.create_version()

        self.versions["serial_number"] = harv.harv_id
        resp, _ = self.create_version()

        resp = self.client.get(self.version_url)
        data = resp.json()["data"]
        self.assertEqual(data["count"], 2)

        resp = self.client.get(f"{self.version_url}?harv_id={harv.harv_id}")
        data = resp.json()["data"]
        self.assertEqual(data["count"], 1)
        self.assertEqual(data["results"][0]["harvester"], harv.id)

    ## Integration with Harvester

    def test_harv_version_release(self):
        # Create release
        r, _ = self.create_release()

        # Set to harvester
        self.client.patch(self.harv_det_url(1), data={"release": 1})

        # Upload version from harvester
        self.create_version()

        # GET harvester and check release + versions
        resp = self.client.get(self.harv_det_url(1))
        data = resp.json()["data"]
        self.assertDictEqual(data["release"]["release"], self.release)
        self.assertDictEqual(data["version"]["report"], self.versions)

        # Update version and re-check
        self.create_version(versions=self.version2)
        resp = self.client.get(self.harv_det_url(1))
        data = resp.json()["data"]
        self.assertDictEqual(data["release"]["release"], self.release)
        self.assertDictEqual(data["version"]["report"], self.version2)

    def test_no_release(self):
        self.create_version()

        resp = self.client.get(self.harv_det_url(1))
        data = resp.json()["data"]
        self.assertIsNone(data["release"])
        self.assertDictEqual(data["version"]["report"], self.versions)

    def test_no_versions(self):
        self.create_release()
        self.client.patch(self.harv_det_url(1), data={"release": 1})

        resp = self.client.get(self.harv_det_url(1))
        data = resp.json()["data"]
        self.assertDictEqual(data["release"]["release"], self.release)
        self.assertIsNone(data["version"])

    def test_version_history(self):
        self.create_release()
        self.client.patch(self.harv_det_url(1), data={"release": 1})
        self.create_version()
        self.create_version(versions=self.version2)

        harv_url = self.harv_det_url(1)

        harv_resp = self.client.get(harv_url)
        vers_hist_rel_url = harv_resp.json()["data"]["version_history"]

        # Version history is relative to the current harv endpoint
        hist_url = urljoin(harv_url, vers_hist_rel_url)
        hist_resp = self.client.get(hist_url)
        hist_data = hist_resp.json()["data"]
        self.assertEqual(hist_data["count"], 2)

    def test_release_history(self):
        self.create_release()
        self.client.patch(self.harv_det_url(1), data={"release": 1})

        rel2 = self.release.copy()
        rel2["version"] = 2.0
        self.create_release(release=rel2)
        self.client.patch(self.harv_det_url(1), data={"release": 2})

        harv_url = self.harv_det_url(1)
        harv_resp = self.client.get(harv_url)

        # Release history is relative to the API root endpoint
        harv_hist_url = (
            self.api_base_url + harv_resp.json()["data"]["harvester_history"]
        )
        hist_resp = self.client.get(harv_hist_url)
        hist_data = hist_resp.json()["data"]

        self.assertEqual(
            hist_data["count"], 3
        )  # The initial PATCH also introduced a history entry
        for res in hist_data["results"]:
            self.assertEqual(res["harv_id"], self.test_objects["harvester"].harv_id)

    def test_conflicts(self):
        rel2 = self.release.copy()
        rel2["version"] = "2.0"
        self.create_release(release=rel2)
        self.client.patch(self.harv_det_url(1), data={"release": 1})

        # Conflicts with version 1
        resp, _ = self.create_version()
        conflicts = resp.json()["data"]["conflicts"]
        self.assertNotEqual(len(conflicts), 0)
        self.assertDictContainsSubset(conflicts, self.versions["data"])

        # No conflicts with version 2
        resp, _ = self.create_version(versions=self.version2)
        conflicts = resp.json()["data"]["conflicts"]
        self.assertEqual(len(conflicts), 0)

        # Version with errors
        error = {"robot01": {"error": "Can't connect to robot01"}}
        vers2 = self.version2.copy()
        vers2["data"].update(error)

        resp, _ = self.create_version(versions=vers2)
        conflicts = resp.json()["data"]["conflicts"]
        self.assertNotEqual(len(conflicts), 0)
        self.assertDictEqual(error, conflicts)

    def test_create_release_with_tags(self):
        """Test adding release with tags"""
        self.release["tags"] = ["New Tag", "Complete"]
        resp, _ = self.create_release(self.release)

        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)
        self.assertEqual(len(resp.data["tags"]), 2)
        self.assertCountEqual(self.release["tags"], resp.data["tags"])

    def test_modify_release_tags(self):
        """Test modifying release tags"""
        self.release["tags"] = ["New Tag", "Complete"]
        resp, _ = self.create_release(self.release)

        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)
        self.assertEqual(len(resp.data["tags"]), 2)
        self.assertCountEqual(self.release["tags"], resp.data["tags"])

        self.release["tags"] = ["Errored"]
        resp = self.client.patch(
            f"{self.release_url}{resp.data['id']}/update_tags/",
            self.release,
            format="json",
        )
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(len(resp.data["data"]["tags"]), 1)
        self.assertCountEqual(self.release["tags"], resp.data["data"]["tags"])

    def test_release_installed_harvesters(self):
        """Test for harvesters with installed release."""
        resp, _ = self.create_release(self.release)

        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)

        release_obj = HarvesterCodeRelease.objects.get(pk=resp.data["id"])
        harvester = self.test_objects["harvester"]
        harvester.release = release_obj
        harvester.save()
        harvester.refresh_from_db()

        resp = self.client.get(f"{self.release_det_url(release_obj.id)}harvesters/")

        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(resp.data["data"]["count"], 1)
        self.assertEqual(resp.data["data"]["results"][0]["harv_id"], harvester.harv_id)

    def test_release_tags_endpoint(self):
        """Test release tags endpoint."""
        tags = ["New Tag", "Complete", "Success"]
        self.release["tags"] = tags
        resp, _ = self.create_release(self.release)

        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)

        resp = self.client.get(f"{self.release_url}tags/")

        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(len(resp.data["data"]["tags"]), 3)
        self.assertCountEqual(resp.data["data"]["tags"], tags)
