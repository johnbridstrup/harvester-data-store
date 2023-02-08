from common.async_metrics import ASYNC_ERROR_COUNTER
from common.models import Tags
from common.serializers.reportserializer import ReportSerializerBase
from ..tasks import extract_exceptions
from ..models import ErrorReport, DEFAULT_UNKNOWN
from harvester.serializers.harvesterserializer import HarvesterSerializer
from location.serializers.locationserializer import LocationSerializer
from event.models import Event
from event.serializers import PickSessionSerializerMixin
from exceptions.models import AFTException, AFTExceptionCode
from exceptions.serializers import AFTExceptionSerializer
from exceptions.utils import sort_exceptions
from collections.abc import Mapping
from rest_framework import serializers
from taggit.serializers import TagListSerializerField, TaggitSerializer

import logging


NO_TRACEBACK_STR = 'No Traceback Available (HDS)'
NO_VALUE_STR = 'No Value Available (HDS)'
FAILED_SPLIT_MSG = "Failed to split into service and index"
EXC_EXT_FAIL_MSG = "Error extracting exceptions"


class ErrorReportSerializer(TaggitSerializer, PickSessionSerializerMixin, ReportSerializerBase):
    """Serializer for the ErrorReport model"""
    report_type = "error"
    
    # Additional report schema properties
    REPORT_DATA_PROPERTIES = {
        "sysmon_report": {
            "type": "object",
            "patternProperties": {
                # Match "sysmon.x" and "sysmon_ap.x"
                "^(sysmon)(_ap)?\.[0-9][0-9]?": {
                    "type": "object",
                    "properties": {
                        "index": {"type": "integer"},
                        "robot_index": {"type": "integer"},
                        "version": {"type": ["string", "number"]},
                        "errors": {
                            "type": "object",
                            "patternProperties": {
                                "^\S*\.[0-9][0-9]?": {"type": "object"}
                            },
                            "additionalProperties": False,
                        },
                        "services": {"type": "object"},
                        "chrony_info": {"type": "object"},
                    },
                },
                # Match "info_<any word>"
                # This allows new info to be added in a controlled way
                "info_\S*": {"type": ["string", "number", "object"]},
            },
            # These properties have already been hard-coded elsewhere
            # and are used explicitly by hds
            "properties": {
                "fruit": {"type": "string"},
                "is_emulator": {"type": "boolean"},
                "scene": {"type": ["string", "null"]},
                "serial_number": {"type": ["number", "string"]}
            },
            "required": ["serial_number"],
            # The below requires new additions to either be added to 
            # HDS first or contain "info_"
            "additionalProperties": False, 
        },
        "uuid": {
            "type": "string",
        },
    }
    REPORT_DATA_REQUIRED = ["sysmon_report",]

    # Serializer fields
    exceptions = AFTExceptionSerializer(many=True, required=False)
    tags = TagListSerializerField(required=False)

    def create(self, validated_data):
        report_inst = super().create(validated_data)
        extract_exceptions.delay(report_inst.id)
        return report_inst

    def to_representation(self, instance):
        data = super().to_representation(instance)
        harv_data = HarvesterSerializer(instance.harvester).data
        location_data = LocationSerializer(instance.location).data
        data['location'] = location_data
        data['harvester'] = harv_data
        return data

    def to_internal_value(self, data):
        try:
            self.validate_incoming_report(data)
            tags = []
        except serializers.ValidationError:
            # We will try anyway.
            # This failure has already been logged.
            # The tag will only apply if we are able to ingest.
            tags = [Tags.INVALIDSCHEMA.value]

        report = data.copy()
        harv_id = self.get_serial_number(report)
        harvester = self.get_harvester(harv_id, report['data']['sysmon_report'])
        reportTime = self.extract_timestamp(report)
        githash = report['data'].get('githash') or DEFAULT_UNKNOWN
        gitbranch = report['data'].get('branch_name') or DEFAULT_UNKNOWN
        UUID = report['data'].get("uuid", None)
        pick_session_uuid = self.extract_uuid(report, "pick_session_uuid")
        if UUID is None:
            UUID = Event.generate_uuid()
        data = {
            'harvester': harvester.id,
            'location': harvester.location.id,
            'reportTime': reportTime,
            'report': report,
            'UUID': UUID,
            'githash': githash,
            'gitbranch': gitbranch,
            'tags': tags,
            'pick_session_uuid': pick_session_uuid,
        }
        return super().to_internal_value(data)

    @classmethod
    def _extract_exception_data(cls, report):
        sysmon_report = report.report['data']['sysmon_report']
        errors = []
        incomplete = False
        for key, sysmon_entry in sysmon_report.items():
            if not isinstance(sysmon_entry, Mapping):
                logging.info(f"Skipping sysmon entry {key}: {sysmon_entry}")
                continue
            for serv, errdict in sysmon_entry.get('errors', {}).items():
                try:
                    service, index = serv.split('.')
                except ValueError as e:
                    logging.exception(FAILED_SPLIT_MSG)
                    ASYNC_ERROR_COUNTER.labels("_extract_exception_data", ValueError.__name__, FAILED_SPLIT_MSG).inc()
                    incomplete = True
                    continue
                robot = sysmon_entry.get('robot_index', index)
                node = sysmon_entry.get('index', index)
                code = errdict.get('code', 0)
                timestamp = cls.extract_timestamp(errdict, key="ts")
                traceback = errdict.get('traceback', NO_TRACEBACK_STR)
                info = errdict.get('value', NO_VALUE_STR)
                handled = errdict.get('handled', False)
                errors.append(
                    {
                        "code": code,
                        "service": service,
                        "node": node,
                        "robot": robot,
                        "traceback": traceback,
                        "info": info,
                        "timestamp": timestamp,
                        "handled": handled
                    }
                )
        if incomplete:
            report.tags.add(Tags.INCOMPLETE.value)
            report.save()
        return errors

    @classmethod
    def extract(cls, report, user=None):
        errors = cls._extract_exception_data(report)
        if user:
            creator = user
        else:
            creator = report.creator

        exceptions = []
        if errors is not None:
            for error in errors:
                error['report'] = report
                error['timestamp'] = error['timestamp']
                error['code'] = AFTExceptionCode.objects.get(code=error['code'])
                exceptions.append(AFTException.objects.create(**error, creator=creator, primary=False))
            
            sorted_excs = sort_exceptions(exceptions)
            if len(sorted_excs) > 0:
                sorted_excs[0].primary = True
                sorted_excs[0].save()

    class Meta:
        model = ErrorReport
        fields = ('__all__')
        read_only_fields = ('creator',)


class ErrorReportListSerializer(serializers.ModelSerializer):
    # Serializer fields
    exceptions = AFTExceptionSerializer(many=True)
    tags = TagListSerializerField()
    harvester = HarvesterSerializer()
    location = LocationSerializer()
    
    class Meta:
        model = ErrorReport
        fields = (
            'id',
            'reportTime',
            'harvester',
            'location',
            'gitbranch',
            'githash',
            'event',
            'exceptions',
            'tags',
        )


class ParetoSerializer(serializers.Serializer):
    # Turns queryset into data with value and count
    value = serializers.CharField() # Can be int or str
    count = serializers.IntegerField()

    def __init__(self, instance=None, data=..., new_name=None, **kwargs):
        super().__init__(instance, data, **kwargs)
        self.new_name=new_name

    def to_representation(self, instance):
        data = super().to_representation(instance)

        if self.new_name is not None:
            data[f"{self.new_name}"] = data.pop("value")

        return data

   