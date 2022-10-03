from .HarvJobApiTestBase import HarvJobApiTestBase
from rest_framework import status


class JobTypeApiTestCase(HarvJobApiTestBase):
    def test_create_jobtype(self):
        payload, resp = self.create_jobtype()

        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)

        data = resp.json()['data']
        self.assertEqual(data['name'], payload['name'])

    def test_get_jobtypes(self):
        self.create_jobtype()
        self.create_jobtype('job2')

        r = self.client.get(self.jobtype_url)
        self.assertEqual(r.status_code, status.HTTP_200_OK)

        data = r.json()['data']
        self.assertEqual(data['count'], 2)

    def test_get_jobtype_by_id(self):
        self.create_jobtype()
        payload, _ = self.create_jobtype('job2')

        r = self.client.get(self.jobtype_detail_url(2))
        self.assertEqual(r.status_code, status.HTTP_200_OK)

        data = r.json()['data']
        self.assertEqual(data['name'], payload['name'])




