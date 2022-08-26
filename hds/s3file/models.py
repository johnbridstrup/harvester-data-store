from django.db import models
from common.models import CommonInfo
from event.models import EventModelMixin

import logging


class S3File(EventModelMixin, CommonInfo):
    bucket = models.CharField(max_length=40)
    key = models.CharField(max_length=80)
    filetype = models.CharField(max_length=40)

    def __str__(self) -> str:
        return f"{self.filetype}: {self.bucket}/{self.key}"

    def generate_download_link(self):
        # Only import when this function is called.
        # This avoids a lot of error output locally without credentials.
        from .s3 import s3_client, ClientError
        params = {
            "Bucket": self.bucket,
            "Key": self.key,
        }

        try:
            resp = s3_client.generate_presigned_url(
                'get_object',
                Params=params,
                ExpiresIn=300,
            )
        except ClientError as e:
            logging.error(e)
            return None

        return resp
