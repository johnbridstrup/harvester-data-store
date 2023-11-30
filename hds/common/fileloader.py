import json
import os
import structlog

import boto3
from botocore.exceptions import ClientError
from django.conf import settings


def get_client():
    if settings.USES3:
        return S3Client()
    return LocalClient()


class FileLoader:
    def _load_body(self, event):
        event_body = json.loads(event['Body'])
        return event_body

    def download_json_from_event(self, event):
        pass

    def delete_file(self, key, bucket=None):
        pass


class S3Client(FileLoader):
    def __init__(self):
        self._bucket = os.environ.get("S3_BUCKET")
        self._session = boto3.Session(profile_name=os.environ.get("AWS_PROFILE"))
        self._client = self._session.client('s3')
        self._logger = structlog.getLogger(__name__)

    def _get_key_bucket(self, event):
        event_body = self._load_body(event)
        s3_info = event_body["Records"][0].get("s3")
        if s3_info is None:
            raise ClientError("No S3 info in event")

        bucket = s3_info["bucket"]["name"]
        key = s3_info["object"]["key"]

        return key, bucket

    def has_credentials(self):
        if self._session.get_credentials() is None:
            return False
        return True

    def download_json_from_event(self, event):
        key, bucket = self._get_key_bucket(event)

        response = self._client.get_object(Bucket=bucket, Key=key)
        file_content = response["Body"].read().decode("utf-8")
        json_data = json.loads(file_content)
        return json_data

    def delete_file(self, event):
        key, bucket = self._get_key_bucket(event)
        self._client.delete_object(Bucket=bucket, Key=key)
        self._logger.info(f"{key} deleted from S3")


class LocalClient(FileLoader):
    def download_json_from_event(self, event):
        event_body = self._load_body(event)
        s3_info = event_body["Records"][0].get("s3")
        if s3_info is None:
            raise ClientError("No S3 info in event")

        key = s3_info["object"]["key"]
        with open(key, 'r') as file_content:
            json_data = json.load(file_content)

        return json_data
