from storages.backends.s3boto3 import S3Boto3Storage
from django.conf import settings


bucket_name = settings.AWS_STORAGE_BUCKET_NAME


class StaticStorage(S3Boto3Storage):
    bucket_name = bucket_name
    location = 'static'


class MediaStorage(S3Boto3Storage):
    bucket_name = bucket_name
    location = '' # We can't use 'media' here, since harvesters upload files to different root prefixes
    file_overwrite = False