from rest_framework import serializers
from common.metrics import ERROR_COUNTER
from harvester.models import Harvester
from event.models import Event
from event.serializers import EventSerializerMixin
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
                "patternProperties": {},
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
    # Override these in new report serializers
    REPORT_DATA_PROPERTIES = {}
    REPORT_DATA_PATTERN_PROPERTIES = {}
    REPORT_DATA_REQUIRED = [] 
    REPORT_DATA_ALLOW_EXTRA = True

    @classmethod
    def get_schema(cls):
        schema = cls.REPORT_BASE_SCHEMA
        schema["properties"]["data"]["properties"] = cls.REPORT_DATA_PROPERTIES
        schema["properties"]["data"]["patternProperties"] = cls.REPORT_DATA_PATTERN_PROPERTIES
        schema["properties"]["data"]["required"] = cls.REPORT_DATA_REQUIRED
        schema["properties"]["data"]["additionalProperties"] = cls.REPORT_DATA_ALLOW_EXTRA
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
    def extract_uuid(cls, report):
        try:
            UUID = report["uuid"]
        except KeyError:
            UUID = report["data"].get("uuid", None)
        if UUID is None:
            UUID = Event.generate_uuid()
        return UUID

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

    @classmethod
    def extract_basic(cls, report, fruit_key="fruit"):
        reportTime = cls.extract_timestamp(report)
        UUID = cls.extract_uuid(report)
        harv_id = cls.get_serial_number(report)
        harv = cls.get_harvester(harv_id, report, fruit_key=fruit_key)
        data = {
            "report": report,
            "reportTime": reportTime,
            "UUID": UUID,
            "harvester": harv.id,
            "location": harv.location.id,
        }
        return data

    @classmethod
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
