from django.test import TestCase
from django.contrib.auth.models import User
from ..models import S3File
from event.models import Event

class S3FileTestCase(TestCase):
    """ Test S3File model """
    BUCKET = "test_bucket"
    KEY = "test_key"
    FILETYPE = "test_file"
    UUID = Event.generate_uuid()

    @classmethod
    def setUpTestData(cls):
        """ create a fruit """
        creator = User.objects.create(id=1, username='test_user')
        event = Event.objects.create(creator=creator, UUID=cls.UUID)
        S3File.objects.create(
            creator=creator, 
            bucket=cls.BUCKET,
            key=cls.KEY,
            filetype=cls.FILETYPE,
            event=event,
        )

    def test_s3file_str(self):
        """ check if created fruit exits """
        file = S3File.objects.get(event__UUID=self.UUID)
        self.assertEqual(str(file), f"{file.filetype}: {file.bucket}/{file.key}")