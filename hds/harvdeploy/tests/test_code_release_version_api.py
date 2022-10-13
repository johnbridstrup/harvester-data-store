from ..models import HarvesterCodeRelease, HarvesterVersionReport
from harvester.models import Harvester
from common.tests import HDSAPITestBase

import time
from dateutil import parser as dateparser
from urllib.parse import urljoin

from rest_framework import status


class ReleaseApiTestCase(HDSAPITestBase):
    def setUp(self):
        super().setUp()
        self.update_user_permissions_all(HarvesterCodeRelease)
        self.update_user_permissions_all(HarvesterVersionReport)
        self.update_user_permissions_all(Harvester)
        self.test_objects = self._setup_basic()

        self.release = {
            "version": 1.0,
            "master": {},
            "robot": {},
            "stereo": {}, 
            "project": self.test_objects["fruit"].name
        }

        self.versions = {
            "type": "version",
            "data": {
                "serial_number": self.test_objects["harvester"].harv_id,
                "master": {"version": 1.0, "dirty": {}},
                "robot.1": {"version": 1.0, "dirty": {}},
                "stereo.1": {"version": 1.0, "dirty": {}},
                "robot.2": {"version": 1.0, "dirty": {}},
                "stereo.2": {"version": 1.0, "dirty": {}},
            }
        }

        self.version2 = {
            "type": "version",
            "data": {
                "serial_number": self.test_objects["harvester"].harv_id,
                "master": {"version": 2.0, "dirty": {}},
                "robot.1": {"version": 2.0, "dirty": {}},
                "stereo.1": {"version": 2.0, "dirty": {}},
                "robot.2": {"version": 2.0, "dirty": {}},
                "stereo.2": {"version": 2.0, "dirty": {}},
            }
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

    def test_get_releases_by_fruit(self):
        self.create_release()

        fruit2 = "apple"
        fruit2_obj = self.create_fruit_object(fruit2)
        release2 = self.release
        release2['project'] = fruit2
        release2['version'] = 1.111
        self.create_release(release2)

        # assert both are there
        resp = self.client.get(
            f"{self.api_base_url}/release/"
        )
        data = resp.json()['data']
        self.assertEqual(
            data['count'],
            2
        )

        #assert only apple release retrieved
        resp = self.client.get(
            f"{self.api_base_url}/release/?fruit=apple"
        )
        data = resp.json()['data']
        self.assertEqual(
            data['count'],
            1
        )
        self.assertEqual(
            data['results'][0]['fruit']['id'],
            fruit2_obj.id
        )


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
    ## HarvesterVersionReport

    def create_version(self, versions=None, ts=None):
        if versions is None:
            versions = self.versions
        if ts is None:
            versions['timestamp'] = time.time()
        else:
            versions['timestamp'] = ts
        
        
        resp = self.client.post(
            f"{self.api_base_url}/harvversion/",
            data=versions,
            format='json'
        )

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
        self.versions['data']['robot.1']['dirty']['reverted-package'] = 'bad-version'
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

        resp = self.client.get(f"{self.api_base_url}/harvversion/")
        self.assertEqual(resp.json()['data']['count'], 2)

    def test_get_version_by_id(self):
        self.create_version()
        self.create_version(versions=self.version2)

        resp = self.client.get(f"{self.api_base_url}/harvversion/2/")
        data = resp.json()['data']

        self.assertDictEqual(data['report'], self.version2)

    def test_version_history_by_harv_id(self):
        harv = self.create_harvester_object(
            15,
            self.test_objects['fruit'],
            self.test_objects['location'],
            'new_harv',
            self.user
        )
        resp,_ = self.create_version()

        self.versions['data']['serial_number'] = harv.harv_id
        resp,_ = self.create_version()

        resp = self.client.get(f"{self.api_base_url}/harvversion/")
        data = resp.json()['data']
        self.assertEqual(data['count'], 2)

        resp = self.client.get(f"{self.api_base_url}/harvversion/?harv_id={harv.harv_id}")
        data = resp.json()['data']
        self.assertEqual(data['count'], 1)
        self.assertEqual(
            data['results'][0]['harvester'],
            harv.id
        )
      
    ## Integration with Harvester

    def test_harv_version_release(self):
        # Create release
        r,_=self.create_release()

        # Set to harvester
        self.client.patch(f"{self.api_base_url}/harvesters/1/", data={"release": 1})

        # Upload version from harvester
        self.create_version()

        # GET harvester and check release + versions
        resp = self.client.get(f"{self.api_base_url}/harvesters/1/")
        data = resp.json()["data"]
        self.assertDictEqual(data["release"]["release"], self.release)
        self.assertDictEqual(data["version"]["report"], self.versions)

        # Update version and re-check
        self.create_version(versions=self.version2)
        resp = self.client.get(f"{self.api_base_url}/harvesters/1/")
        data = resp.json()["data"]
        self.assertDictEqual(data["release"]["release"], self.release)
        self.assertDictEqual(data["version"]["report"], self.version2)

    def test_no_release(self):
        self.create_version()

        resp = self.client.get(f"{self.api_base_url}/harvesters/1/")
        data = resp.json()["data"]
        self.assertIsNone(data["release"])
        self.assertDictEqual(data["version"]["report"], self.versions)

    def test_no_versions(self):
        self.create_release()
        self.client.patch(f"{self.api_base_url}/harvesters/1/", data={"release": 1})

        resp = self.client.get(f"{self.api_base_url}/harvesters/1/")
        data = resp.json()["data"]
        self.assertDictEqual(data["release"]["release"], self.release)
        self.assertIsNone(data["version"])

    def test_version_history(self):
        self.create_release()
        self.client.patch(f"{self.api_base_url}/harvesters/1/", data={"release": 1})
        self.create_version()
        self.create_version(versions=self.version2)

        harv_url = f"{self.api_base_url}/harvesters/1/"

        harv_resp = self.client.get(harv_url)
        vers_hist_rel_url = harv_resp.json()["data"]["version_history"]

        # Version history is relative to the current harv endpoint
        hist_url = urljoin(harv_url, vers_hist_rel_url)
        hist_resp = self.client.get(hist_url)
        hist_data = hist_resp.json()["data"]
        self.assertEqual(hist_data["count"], 2)
    
    def test_release_history(self):
        self.create_release()
        self.client.patch(f"{self.api_base_url}/harvesters/1/", data={"release": 1})

        rel2 = self.release.copy()
        rel2["version"] = 2.0
        self.create_release(release=rel2)
        self.client.patch(f"{self.api_base_url}/harvesters/1/", data={"release": 2})

        harv_url = f"{self.api_base_url}/harvesters/1/"
        harv_resp = self.client.get(harv_url)

        # Release history is relative to the API root endpoint
        harv_hist_url = self.api_base_url + harv_resp.json()["data"]["harvester_history"]
        hist_resp = self.client.get(harv_hist_url)
        hist_data = hist_resp.json()["data"]

        self.assertEqual(hist_data["count"], 3) # The initial PATCH also introduced a history entry
        for res in hist_data["results"]:
            self.assertEqual(res["harv_id"], self.test_objects["harvester"].harv_id)
