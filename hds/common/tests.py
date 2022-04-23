from django.test import TestCase
from psycopg2 import IntegrityError
from .models import CommonInfo
from django.contrib.auth.models import User
from django.utils import timezone


class CommonInfoTestCase(TestCase):
    """ Test CommonInfo Model """

    @classmethod
    def setUpTestData(cls):
        """ create a common info """
        CommonInfo.objects.create(
            creator=User.objects.create(username='creator'),
            modifiedBy=User.objects.create(username='modifiedBy'),
            lastModified=timezone.now())

    def test_common_info_str(self):
        """ check if created common info exits """
        common_info = CommonInfo.objects.get(creator__username='creator')
        self.assertEqual(common_info.creator.username, 'creator')

