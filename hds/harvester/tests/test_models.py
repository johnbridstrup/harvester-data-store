from django.test import TestCase
from django.contrib.auth.models import User
from ..models import Fruit, Harvester
from location.models import Location, Distributor


class FruitTestCase(TestCase):
    """ Test Fruit model """
    @classmethod
    def setUpTestData(cls):
        """ create a fruit """
        creator = User.objects.create(id=1, username='test_user')
        Fruit.objects.create(creator=creator, name='Apple')

    def test_fruit_str(self):
        """ check if created fruit exits """
        fruit = Fruit.objects.get(name='Apple')
        self.assertEqual(str(fruit), 'Apple')


class HarvesterTestCase(TestCase):
    @classmethod
    def setUpTestData(cls):
        cls.creator = User.objects.create(id=1, username='test_user')
        cls.fruit = Fruit.objects.create(creator=cls.creator, name='Apple')
        cls.distributor = Distributor.objects.create(creator=cls.creator, name='Distributor 1')
        cls.location = Location.objects.create(
                      creator=cls.creator, distributor=cls.distributor, ranch="Ranch A", country="USA", region="California")

    def test_create_harvester(self):
        """ create harvester and assert it exists """
        harvester = Harvester.objects.create(creator=self.creator, fruit=self.fruit, harv_id=1001,
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

    def test_create_emulator(self):
        harvester = Harvester.objects.create(
            creator=self.creator, 
            fruit=self.fruit, 
            harv_id=1001,
            location=self.location, name="Harvester 1",
            is_emulator=True
        )
        self.assertEqual(Harvester.objects.count(), 1)
        self.assertTrue(harvester.is_emulator)

    def test_duplicate_emulator(self):
        Harvester.objects.create(
            creator=self.creator, 
            fruit=self.fruit, 
            harv_id=1002,
            location=self.location, name="Harvester 1",
            is_emulator=True
        )
        self.assertEqual(Harvester.objects.count(), 1)

        with self.assertRaises(ValueError, msg=f"There can only be one {self.fruit} emulator"):
            Harvester.objects.create(
                creator=self.creator, 
                fruit=self.fruit, 
                harv_id=1001,
                location=self.location, name="Harvester 1",
                is_emulator=True
            )
        
    def test_update_emulator(self):
        harv = Harvester.objects.create(
            creator=self.creator, 
            fruit=self.fruit, 
            harv_id=1002,
            location=self.location, name="Harvester 1",
            is_emulator=True
        )

        harv.harv_id = harv.harv_id + 1
        harv.save()
