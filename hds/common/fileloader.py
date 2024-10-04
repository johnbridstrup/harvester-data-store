import json
import os
import time
import structlog
import boto3
from botocore.exceptions import ClientError
from django.conf import settings
from .S3Event import S3EventObject


def get_client():
    if settings.USES3:
        return S3Client()
    return LocalClient()


class FileLoader:
    def _load_body(self, event):
        event_body = json.loads(event["Body"])
        return event_body

    def download_json_from_event(self, event):
        pass

    def delete_file(self, key, bucket=None):
        pass


class S3Client(FileLoader):
    def __init__(self):
        self._bucket = os.environ.get("S3_BUCKET")
        self._session = boto3.Session(
            profile_name=os.environ.get("AWS_PROFILE")
        )
        self._client = self._session.client("s3")
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
        s3_event = S3EventObject(event)
        record = s3_event.get_record()
        response = self._client.get_object(Bucket=record.bucket, Key=record.key)
        file_content = response["Body"].read().decode("utf-8")
        json_data = json.loads(file_content)
        return json_data

    def delete_file(self, event):
        s3_event = S3EventObject(event)
        record = s3_event.get_record()
        self._client.delete_object(Bucket=record.bucket, Key=record.key)
        self._logger.info(f"{record.key} deleted from S3")

    def generate_presigned_url(self, key, file_type):
        presigned_url = self._client.generate_presigned_url(
            "put_object",
            Params={
                "Bucket": settings.AWS_STORAGE_BUCKET_NAME,
                "Key": key,
                "ContentType": file_type,
            },
            ExpiresIn=3600,
        )
        return presigned_url

    def head_object(self, key):
        self._client.head_object(
            Bucket=settings.AWS_STORAGE_BUCKET_NAME, Key=key
        )

    def check_s3_file(self, key):
        retries = 5
        while retries > 0:
            try:
                self.head_object(key)
                return True
            except ClientError as e:
                if e.response["Error"]["Code"] == "404":
                    retries -= 1
                    if retries <= 0:
                        self._logger.error(
                            f"File not found after {5 - retries} retries: {key}"
                        )
                        return False
                    self._logger.warning(
                        f"File not found, retrying... ({5 - retries})"
                    )
                    time.sleep(5)  # Add delay between retries
                else:
                    self._logger.error(f"Client Error occured: {str(e)}")
                    return False


class LocalClient(FileLoader):
    def download_json_from_event(self, event):
        event_body = self._load_body(event)
        s3_info = event_body["Records"][0].get("s3")
        if s3_info is None:
            raise ClientError("No S3 info in event")

        key = s3_info["object"]["key"]
        with open(key, "r") as file_content:
            json_data = json.load(file_content)

        return json_data
