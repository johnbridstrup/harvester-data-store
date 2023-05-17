""" Test Harvester APIs """
from common.tests import HDSAPITestBase
from location.models import Location, Distributor

from ..models import Harvester, Fruit


class HarvesterAPITest(HDSAPITestBase):
    """ Test Harvester APIs """
    def setUp(self):
        super().setUp()
        self.distributor = Distributor.objects.create(name='Distributor 1', creator=self.user)
        self.location = Location.objects.create(
            distributor=self.distributor, ranch='Ranch 1', country='USA', region='Region 1', creator=self.user)
        self.fruit = Fruit.objects.create(name='Strawberry', creator=self.user)

        # initialize data
        # to create via objects.create()
        self.data = {
            'harv_id': 1,
            'fruit': self.fruit.id,
            'location': self.location.id,
            'name': 'Harvester 1'
        }
        # to create via APIs
        self.data1 = {
            'harv_id': 1,
            'fruit': self.fruit,
            'location': self.location,
            'name': 'Harvester 1',
            'creator': self.user
        }
        self.data2 = {
            'harv_id': 2,
            'fruit': self.fruit,
            'location': self.location,
            'name': 'Harvester 2',
            'creator': self.user
        }

    def test_create_harvester(self):
        """ create harvester and assert it exists """
        self.client.post(self.harv_url, self.data)
        self.assertEqual(Harvester.objects.count(), 1)
        self.assertEqual(Harvester.objects.get().name, 'Harvester 1')

    def test_create_harvester_with_creator_field_in_post(self):
        """ create harvester with creator different than authenticated user"""
        data = self.data
        data["creator"] = 2
        self.client.post(self.harv_url, data)
        self.assertEqual(Harvester.objects.count(), 1)
        self.assertEqual(Harvester.objects.get().name, 'Harvester 1')
        self.assertNotEqual(Harvester.objects.get().creator, 2)

    def test_create_harvester_with_invalid_fruit(self):
        """ create harvester with invalid fruit """
        data = self.data
        data["fruit"] = 99
        response = self.client.post(self.harv_url, data)
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.data['status'], 'error')
        self.assertEqual(Harvester.objects.count(), 0)

    def test_create_harvester_with_invalid_location(self):
        """ create harvester with invalid location """
        data = self.data
        data["location"] = 99
        response = self.client.post(self.harv_url, data)
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.data['status'], 'error')
        self.assertEqual(Harvester.objects.count(), 0)

    def test_update_harvester(self):
        """ update harvester and assert it exists """
        Harvester.objects.create(**self.data1)
        self.set_user_support()
        self.client.patch(self.harv_det_url(1), {'name': 'Harvester 2'})
        self.assertEqual(Harvester.objects.count(), 1)
        self.assertEqual(Harvester.objects.get().name, 'Harvester 2')

    def test_update_harvester_with_invalid_data(self):
        """ update harvester with invalid data """
        Harvester.objects.create(**self.data1)
        response = self.client.patch(self.harv_det_url(1), {'fruit': 11})
        self.assertEqual(response.data['status'], 'error')
        self.assertEqual(response.status_code, 400)

    def test_delete_harvester(self):
        """ delete harvester and assert it does not exist """
        Harvester.objects.create(**self.data1)
        self.set_user_developer()
        self.client.delete(self.harv_det_url(1))
        self.assertEqual(Harvester.objects.count(), 0)

    def test_get_all_harvesters(self):
        """ get all harvesters """
        Harvester.objects.create(**self.data1)
        Harvester.objects.create(**self.data2)
        response = self.client.get(self.harv_url)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["count"], 2)

    def test_get_harvester_by_id(self):
        """ get harvester by id """
        Harvester.objects.create(**self.data1)
        response = self.client.get(self.harv_det_url(1))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['name'], 'Harvester 1')


