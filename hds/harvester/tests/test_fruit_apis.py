""" Test Fruits APIs """
from common.tests import HDSAPITestBase

from ..models import Fruit


class FruitAPITest(HDSAPITestBase):
    """ Test Fruits APIs """
    def setUp(self):
        super().setUp()

    def test_create_fruit(self):
        """ create fruit and assert it exists """
        self.client.post(f'{self.api_base_url}/fruits/', {'name': 'Apple'})
        self.assertEqual(Fruit.objects.count(), 1)
        self.assertEqual(Fruit.objects.get().name, 'Apple')

    def test_create_fruit_with_invalid_name(self):
        """ create fruit with invalid name """
        resp = self.client.post(f'{self.api_base_url}/fruits/', {'name': ''})
        self.assertEqual(resp.data['status'], 'error')
        self.assertEqual(Fruit.objects.count(), 0)

    def test_update_fruit(self):
        """ update fruit and assert it exists """
        Fruit.objects.create(name='Apple', creator=self.user)
        self.client.put(f'{self.api_base_url}/fruits/1/', {'name': 'Orange'})
        self.assertEqual(Fruit.objects.count(), 1)
        self.assertEqual(Fruit.objects.get().name, 'Orange')

    def test_delete_fruit(self):
        """ delete fruit and assert it does not exist """
        Fruit.objects.create(name='Apple', creator=self.user)
        self.client.delete(f'{self.api_base_url}/fruits/1/')
        self.assertEqual(Fruit.objects.count(), 0)

    def test_get_all_fruits(self):
        """ get all fruits """
        Fruit.objects.create(name='Apple', creator=self.user)
        Fruit.objects.create(name='Orange', creator=self.user)
        response = self.client.get(f'{self.api_base_url}/fruits/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["count"], 2)

    def test_get_fruit_by_id(self):
        """ get fruit by id """
        Fruit.objects.create(name='Apple', creator=self.user)
        response = self.client.get(f'{self.api_base_url}/fruits/1/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['name'], 'Apple')


