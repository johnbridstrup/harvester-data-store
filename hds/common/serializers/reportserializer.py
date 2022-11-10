from rest_framework import serializers
from common.metrics import ERROR_COUNTER
from harvester.models import Harvester
import datetime
import jsonschema
import logging


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
            },
            "serial_number": {
                "type": ["string", "number"]   
            }
        },
        "required": ["data", "timestamp", "serial_number"],
    }
    REPORT_DATA_PROPERTIES = {}
    REPORT_DATA_REQUIRED = [] # Override these in new report serializers

    @classmethod
    def get_schema(cls):
        schema = cls.REPORT_BASE_SCHEMA
        schema["properties"]["data"]["properties"] = cls.REPORT_DATA_PROPERTIES
        schema["properties"]["data"]["required"] = cls.REPORT_DATA_REQUIRED
        return schema

    @classmethod
    def validate_incoming_report(cls, data):
        schema = cls.get_schema()
        try:
            jsonschema.validate(data, schema)
        except jsonschema.ValidationError as e:
            if e.validator == "type":
                err = { 
                    "path": e.json_path,
                    "error": f"Must be {e.validator_value}"
                }
            else:
                err = str(e.message)
            
            msg = f"Failed to validate: {e.validator}"       
            ERROR_COUNTER.labels(serializers.ValidationError.__name__, msg, cls.__name__).inc()
            logging.exception(err)
            raise serializers.ValidationError(detail={"validation error": err})

    @classmethod
    def extract_timestamp(cls, report, key="timestamp"):
        """get POSIX timestamp and return in date format"""
        return datetime.datetime.fromtimestamp(report[key]).strftime('%Y-%m-%d %H:%M:%S.%f')

    @classmethod
    def get_serial_number(cls, report):
        try:
            sn = report["serial_number"]
        except KeyError:
            try:
                sn = report["data"]["serial_number"]
            except KeyError:
                ERROR_COUNTER.labels(KeyError.__name__, "Serial number not found!", cls.__name__)
                logging.error(f"Serial number not found! {cls.__name__}")
                raise
            ERROR_COUNTER.labels(KeyError.__name__, "Serial number not at top level", cls.__name__)
        return int(sn)

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
