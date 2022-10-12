from rest_framework import serializers
from common.metrics import ERROR_COUNTER
from harvester.models import Harvester
import datetime
import jsonschema
import logging
import re


class ReportSerializerBase(serializers.ModelSerializer):
    REPORT_BASE_SCHEMA = {
        "type": "object",
        "properties": {
            "data": {
                "type": "object",
                "properties": {},
                "required": [],     
            },
            "timestamp": {
                "type": "number",
            },
            "type": {
                "type": "string",
            }
        },
        "required": ["data", "timestamp"],
    }
    REPORT_DATA_PROPERTIES = {}
    REPORT_DATA_REQUIRED = [] # Override these in new report serializers

    @classmethod
    def validate_incoming_report(cls, data):
        schema = cls.REPORT_BASE_SCHEMA
        schema["properties"]["data"]["properties"] = cls.REPORT_DATA_PROPERTIES
        schema["properties"]["data"]["required"] = cls.REPORT_DATA_REQUIRED
        try:
            jsonschema.validate(data, schema)
        except jsonschema.ValidationError as e:
            if e.validator == "type":
                err = { 
                    "path": e.json_path,
                    "error": f"Must be {e.validator_value}"
                }
            elif e.validator == "required":
                err = re.findall(r"'(?:[^']|'')*'* is a required property", str(e))
            else:
                err = str(e)
            
            msg = f"Failed to validate: {e.validator}"       
            ERROR_COUNTER.labels(serializers.ValidationError.__name__, msg, cls.__name__).inc()
            logging.exception(data)
            raise serializers.ValidationError(detail={"validation error": err})

    @classmethod
    def extract_timestamp(cls, timestamp):
        """get POSIX timestamp and return in date format"""
        return datetime.datetime.fromtimestamp(timestamp).strftime('%Y-%m-%d %H:%M:%S.%f')

    def get_harvester(self, harv_id, report, fruit_key="fruit"):
        # must pass in level of report with is_emulator and fruit keys
        is_emulator = report.get("is_emulator", False)
        if is_emulator:
            fruit = report.get(fruit_key)
            # This is something of a hack. Our emulator runners have overlapping 
            # harv ids, so we should grab a single "fruit" emulator for now.
            harv = Harvester.objects.get(is_emulator=True, fruit__name=fruit)
        else:
            harv = Harvester.objects.get(harv_id=harv_id)
        
        return harv
