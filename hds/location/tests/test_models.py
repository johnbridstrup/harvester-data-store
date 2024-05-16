from django.test import TestCase
from django.contrib.auth.models import User

from ..models import Distributor, Location


class DistributorTestCase(TestCase):
    """Test Distributor model"""

    @classmethod
    def setUpTestData(cls):
        """create a distributor"""
        creator = User.objects.create(id=1, username="test_user")
        Distributor.objects.create(creator=creator, name="Distributor 1")

    def test_distributor_str(self):
        """check if created distributor exits"""
        distributor = Distributor.objects.get(name="Distributor 1")
        self.assertEqual(str(distributor), "Distributor 1")


class LocationTest(TestCase):
    @classmethod
    def setUpTestData(cls):
        cls.creator = User.objects.create(id=1, username="test_user")
        cls.distributor = Distributor.objects.create(
            creator=cls.creator, name="Distributor 1"
        )

    def test_create_location(self):
        """create location and assert it exists"""
        location = Location.objects.create(
            creator=self.creator,
            distributor=self.distributor,
            ranch="Ranch A",
            country="USA",
            region="California",
        )
        self.assertEqual(str(location), "Ranch A")
        self.assertEqual(location.distributor, self.distributor)

    def test_create_location_with_invalid_distributor(self):
        """create location with invalid distributor"""
        with self.assertRaises(ValueError):
            Location.objects.create(
                creator=self.creator,
                distributor="Distributor 2",
                ranch="Ranch A",
                country="USA",
                region="California",
            )
