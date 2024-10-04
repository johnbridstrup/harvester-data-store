# Class to handle common procedures for S3 event objects
import json
import re

# Harvester ID regex from S3 key
# the key will be of the form some/combo/of/slashes/hv-XXX/filename.ext
# we want to capture the XXX
HARVESTER_ID_REGEX = r"^.*\/hv-(\d{3})\/.*$"


class S3Record:
    def __init__(self, record):
        self.record = record

    @property
    def bucket(self):
        return self.record["s3"]["bucket"]["name"]

    @property
    def key(self):
        return self.record["s3"]["object"]["key"]

    @property
    def size(self):
        return self.record["s3"]["object"]["size"]

    @property
    def s3_info(self):
        return self.record["s3"]

    @property
    def harv_id(self):
        return int(re.search(HARVESTER_ID_REGEX, self.key).group(1))


class S3EventObject:
    def __init__(self, event):
        self.event = event
        self.event_body = self._load_body(event)
        self.records = self._parse_records(self.event_body)

    @staticmethod
    def _load_body(event):
        return json.loads(event["Body"])

    @staticmethod
    def _parse_records(body):
        return [S3Record(record) for record in body["Records"]]

    @property
    def bucket(self):
        return self.event_body["Records"][0]["s3"]["bucket"]["name"]

    @property
    def keys(self):
        return [record.key for record in self._parser_records(self.event_body)]

    def get_record(self, index=0):
        return self.records[index]
