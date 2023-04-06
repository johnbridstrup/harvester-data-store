""" Test Fruits APIs """
from ..models import Distributor
from common.tests import HDSAPITestBase


class DistributorAPITest(HDSAPITestBase):
    """ Test Distributor APIs """
    def setUp(self):
        super().setUp()

    def test_create_distributor(self):
        """ create fruit and assert it exists """
        self.client.post(f'{self.api_base_url}/distributors/', {'name': 'Apple'})
        self.assertEqual(Distributor.objects.count(), 1)
        self.assertEqual(Distributor.objects.get().name, 'Apple')

    def test_create_distributor_with_invalid_name(self):
        """ create fruit with invalid name """
        response = self.client.post(f'{self.api_base_url}/distributors/', {'name': ''})
        self.assertEqual(response.data['status'], 'error')
        self.assertEqual(Distributor.objects.count(), 0)

    def test_update_distributor(self):
        """ update fruit and assert it exists """
        Distributor.objects.create(name='Apple', creator=self.user)
        self.client.put(f'{self.api_base_url}/distributors/1/', {'name': 'Orange'})
        self.assertEqual(Distributor.objects.count(), 1)
        self.assertEqual(Distributor.objects.get().name, 'Orange')

    def test_delete_distributor(self):
        """ delete fruit and assert it does not exist """
        Distributor.objects.create(name='Apple', creator=self.user)
        self.client.delete(f'{self.api_base_url}/distributors/1/')
        self.assertEqual(Distributor.objects.count(), 0)

    def test_get_all_distributors(self):
        """ get all fruits """
        Distributor.objects.create(name='Apple', creator=self.user)
        Distributor.objects.create(name='Orange', creator=self.user)
        response = self.client.get(f'{self.api_base_url}/distributors/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["count"], 2)

    def test_get_distributor_by_id(self):
        """ get fruit by id """
        Distributor.objects.create(name='Apple', creator=self.user)
        response = self.client.get(f'{self.api_base_url}/distributors/1/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['name'], 'Apple')


