import logging
import os

import boto3
from boto3.exceptions import S3UploadFailedError
from botocore.exceptions import ClientError


class S3Client:
    def __init__(self):
        self._bucket = os.environ.get("S3_BUCKET")
        self._session = boto3.Session(profile_name=os.environ.get("AWS_PROFILE"))
        self._client = self._session.client("s3")
        self._logger = logging.getLogger(__name__)

    def has_credentials(self):
        if self._session.get_credentials() is None:
            return False
        return True

    def upload_file(self, filepath, obj_name=None, prefix=None):
        if obj_name is None:
            obj_name = os.path.basename(filepath)

        if prefix:
            obj_name = os.path.join(prefix, obj_name)

        try:
            self._client.upload_file(filepath, self._bucket, obj_name)
        except ClientError:
            self._logger.exception("There is an error with the upload request.")
            raise
        except S3UploadFailedError:
            self._logger.exception("There is an error with the upload.")
            raise
