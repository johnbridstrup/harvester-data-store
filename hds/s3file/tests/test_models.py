from django.test import TestCase
from django.contrib.auth.models import User
from ..models import S3File, SessClip
from event.models import Event


class S3FileTestCase(TestCase):
    """Test S3File model"""

    FILE = "test_file"
    FILETYPE = "test_filetype"
    UUID = Event.generate_uuid()

    @classmethod
    def setUpTestData(cls):
        """create a fruit"""
        creator = User.objects.create(id=1, username="test_user")
        event = Event.objects.create(creator=creator, UUID=cls.UUID)
        S3File.objects.create(
            creator=creator,
            file=cls.FILE,
            filetype=cls.FILETYPE,
            key=cls.FILE,
            event=event,
        )

    def test_s3file_str(self):
        """check if created fruit exits"""
        file = S3File.objects.get(event__UUID=self.UUID)
        self.assertEqual(str(file), file.file)

    def test_create_sessclip(self):
        s3file = S3File.objects.get(event__UUID=self.UUID)
        sessclip = SessClip.objects.create(file=s3file)
        self.assertEqual(s3file, sessclip.file)
