from django.test import TestCase
from .models import Distributor, Location


class DistributorTestCase(TestCase):
    """ Test Distributor model """
    @classmethod
    def setUpTestData(cls):
        """ create a distributor """
        Distributor.objects.create(name='Distributor 1')

    def test_distributor_str(self):
        """ check if created distributor exits """
        distributor = Distributor.objects.get(name='Distributor 1')
        self.assertEqual(str(distributor), 'Distributor 1')

class LocationTest(TestCase):
    @classmethod
    def setUpTestData(cls):
        cls.distributor = Distributor.objects.create(name='Distributor 1')

    def test_create_location(self):
        """ create location and assert it exists """
        location = Location.objects.create(distributor=self.distributor,
              ranch="Ranch A", country="USA", region="California")
        self.assertEqual(str(location), "Ranch A")
        self.assertEqual(location.distributor, self.distributor)

    def test_create_location_with_invalid_distributor(self):
        """ create location with invalid distributor """
        with self.assertRaises(ValueError):
            Location.objects.create(distributor="Distributor 2",
              ranch="Ranch A", country="USA", region="California")

