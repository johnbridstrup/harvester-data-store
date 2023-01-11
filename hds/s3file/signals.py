from django.dispatch import receiver, Signal
from .models import S3File, SessClip

sessclip_uploaded = Signal()

@receiver(sessclip_uploaded)
def create_sessclip(sender, s3file_id, **kwargs):
    s3file = S3File.objects.get(id=s3file_id)
    SessClip.objects.create(file=s3file)