from rest_framework import status

from .HarvJobApiTestBase import HarvJobApiTestBase


class JobSchemaApiTestCase(HarvJobApiTestBase):
    def test_create_jobschema(self):
        jobtype = "test-job"
        self.create_jobtype(jobtype)

        _, resp = self.create_jobschema(jobtype=jobtype)
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)

        data = resp.json()['data']
        self.assertEqual(jobtype, data['jobtype'])

    def test_create_jobschema_duplicate_version_name(self):
        self.create_jobtype()
        self.create_jobschema()

        _, resp = self.create_jobschema()
        self.assertContains(
            response=resp, 
            text='jobtype, version must make a unique set', 
            status_code=status.HTTP_400_BAD_REQUEST
        )
    
    def test_create_same_version_different_names(self):
        jobtype2 = "test-job-2"
        self.create_jobtype()
        self.create_jobtype(name=jobtype2)

        self.create_jobschema()
        _, r = self.create_jobschema(jobtype=jobtype2)
        self.assertEqual(r.status_code, status.HTTP_201_CREATED)

    def test_create_same_name_different_version(self):
        version2 = "2.1"
        self.create_jobtype()

        self.create_jobschema()
        _, r = self.create_jobschema(version=version2)
        self.assertEqual(r.status_code, status.HTTP_201_CREATED)

    def get_jobschemas(self):
        self.create_jobtype()
        self.create_jobschema()
        payload, _ = self.create_jobschema(version="0.2", schema={"new": "schema"})
        r = self.client.get(self.jobschema_url)

        self.assertEqual(r.status_code, status.HTTP_200_OK)

        data = r.json()['data']
        self.assertEqual(data['count'], 2)

        r = self.client.get(self.jobschema_detail_url(2))
        self.assertEqual(r.status_code, status.HTTP_200_OK)

        data = r.json()['data']
        self.assertEqual(data['jobtype'], payload['jobtype'])
        self.assertDictEqual(data['version'], payload['version'])
        self.assertDictEqual(data['schema'], payload['schema'])

        
