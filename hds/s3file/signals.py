from django.dispatch import Signal, receiver

from logparser.tasks import download_create_logsession
from .models import SessClip


sessclip_uploaded = Signal()


@receiver(sessclip_uploaded, sender=SessClip)
def download_sessclip(sender, s3file_id, **kwargs):
    download_create_logsession.delay(s3file_id)
