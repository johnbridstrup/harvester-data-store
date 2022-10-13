""" Test Location APIs """
from location.models import Location, Distributor
from common.tests import HDSAPITestBase

class LocationAPITest(HDSAPITestBase):
    """ Test Location APIs """
    def setUp(self):
        super().setUp()
        self.update_user_permissions_all(Location)
        self.update_user_permissions_all(Distributor)
        self.distributor = Distributor.objects.create(name='Distributor 1', creator=self.user)
        # initialize data
        # to create via objects.create()
        self.data = {
            "distributor": self.distributor.id,
            "ranch": "Ranch A",
            "country": "US",
            "region": "California"
        }
        # to create via APIs
        self.data1 = {
            "distributor": self.distributor,
            "ranch": "Ranch A",
            "country": "US",
            "region": "California",
            'creator': self.user
        }
        self.data2 = {
            "distributor": self.distributor,
            "ranch": "Ranch B",
            "country": "US",
            "region": "Texas",
            'creator': self.user
        }

    def test_create_location(self):
        """ create location and assert it exists """
        self.client.post(f'{self.api_base_url}/locations/', self.data)
        self.assertEqual(Location.objects.count(), 1)
        self.assertEqual(Location.objects.get().ranch, 'Ranch A')

    def test_create_location_with_invalid_data(self):
        """ create harvester with invalid data """
        data = self.data
        data["distributor"] = 99
        response = self.client.post(f'{self.api_base_url}/locations/', data)
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.data['status'], 'error')
        self.assertEqual(Location.objects.count(), 0)

    def test_update_location(self):
        """ update location and assert it exists """
        Location.objects.create(**self.data1)
        self.client.patch(f'{self.api_base_url}/locations/1/', {'ranch': 'New Ranch'})
        self.assertEqual(Location.objects.count(), 1)
        self.assertEqual(Location.objects.get().ranch, 'New Ranch')

    def test_update_location_with_invalid_data(self):
        """ update location with invalid data """
        Location.objects.create(**self.data1)
        response = self.client.patch(f'{self.api_base_url}/locations/1/', {'distributor': 11})
        self.assertEqual(response.data['status'], 'error')
        self.assertEqual(response.status_code, 400)

    def test_delete_location(self):
        """ delete location and assert it does not exist """
        Location.objects.create(**self.data1)
        self.client.delete(f'{self.api_base_url}/locations/1/')
        self.assertEqual(Location.objects.count(), 0)

    def test_get_all_locations(self):
        """ get all locations """
        Location.objects.create(**self.data1)
        Location.objects.create(**self.data2)
        response = self.client.get(f'{self.api_base_url}/locations/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["count"], 2)

    def test_get_location_by_id(self):
        """ get location by id """
        Location.objects.create(**self.data1)
        response = self.client.get(f'{self.api_base_url}/locations/1/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['ranch'], 'Ranch A')


