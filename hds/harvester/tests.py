from django.test import TestCase
from .models import Fruit, Harvester
from location.models import Location, Distributor


class FruitTestCase(TestCase):
    """ Test Fruit model """
    @classmethod
    def setUpTestData(cls):
        """ create a fruit """
        Fruit.objects.create(name='Apple')

    def test_fruit_str(self):
        """ check if created fruit exits """
        fruit = Fruit.objects.get(name='Apple')
        self.assertEqual(str(fruit), 'Apple')


class HarvesterTestCase(TestCase):
    @classmethod
    def setUpTestData(cls):
        cls.fruit = Fruit.objects.create(name='Apple')
        cls.distributor = Distributor.objects.create(name='Distributor 1')
        cls.location = Location.objects.create(
                      distributor=cls.distributor, ranch="Ranch A", country="USA", region="California")

    def test_create_harvester(self):
        """ create harvester and assert it exists """
        harvester = Harvester.objects.create(fruit=self.fruit, harv_id=1001,
                                             location=self.location, name="Harvester 1")

        self.assertEqual(str(harvester), "Harvester 1")

    def test_create_harvester_with_invalid_fruit(self):
        """ create harvester with invalid fruit """
        with self.assertRaises(ValueError):
            Harvester.objects.create(fruit="New Fruit", harv_id=1001,
                                     location=self.location, name="Harvester 1")

    def test_create_harvester_with_invalid_location(self):
        """ create harvester with invalid location """
        with self.assertRaises(ValueError):
            Harvester.objects.create(fruit=self.fruit, harv_id=1001,
                                     location="new location", name="Harvester 1")
