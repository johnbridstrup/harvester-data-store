from common.metrics import ERROR_COUNTER
from common.models import Tags
from common.serializers.reportserializer import ReportSerializerBase
from ..models import ErrorReport
from harvester.models import Harvester
from harvester.serializers.harvesterserializer import HarvesterSerializer
from location.serializers.locationserializer import LocationSerializer
from event.models import Event
from event.serializers import EventSerializerMixin
from exceptions.models import AFTException, AFTExceptionCode
from exceptions.serializers import AFTExceptionSerializer
from collections.abc import Mapping
from rest_framework import serializers
from taggit.serializers import TagListSerializerField

import logging


NO_TRACEBACK_STR = 'No Traceback Available (HDS)'
NO_VALUE_STR = 'No Value Available (HDS)'
FAILED_SPLIT_MSG = "Failed to split into service and index"
EXC_EXT_FAIL_MSG = "Error extracting exceptions"


class ErrorReportSerializer(EventSerializerMixin, ReportSerializerBase):
    """Serializer for the ErrorReport model"""
    # Additional report schema properties
    REPORT_DATA_PROPERTIES = {
        "sysmon_report": {
            "type": "object",
            "required": ["serial_number"],
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
        try:
            self.create_exceptions(report_inst)
        except Exception as e:
            exc = type(e).__name__
            ERROR_COUNTER.labels(exc, EXC_EXT_FAIL_MSG, ErrorReportSerializer.__name__).inc()
            report_inst.tags.add(Tags.INCOMPLETE.value) 
            report_inst.save()
            
            logging.exception(f"{exc} caught in create_exceptions")
        return report_inst

    def to_representation(self, instance):
        data = super().to_representation(instance)
        harv_data = HarvesterSerializer(instance.harvester).data
        location_data = LocationSerializer(instance.location).data
        data['location'] = location_data
        data['harvester'] = harv_data
        return data

    def to_internal_value(self, data):
        self.validate_incoming_report(data)
        report = data.copy()
        harv_id = int(report['data']['sysmon_report']['serial_number'])
        harvester = self.get_harvester(harv_id, report['data']['sysmon_report'])
        reportTime = self.extract_timestamp(report['timestamp'])
        UUID = report['data'].get("uuid", Event.generate_uuid())
        data = {
            'harvester': harvester.id,
            'location': harvester.location.id,
            'reportTime': reportTime,
            'report': report,
            'UUID': UUID,
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
                    ERROR_COUNTER.labels(ValueError.__name__, FAILED_SPLIT_MSG, cls.__name__).inc()
                    incomplete = True
                    continue
                robot = sysmon_entry.get('robot_index', index)
                node = sysmon_entry.get('index', index)
                code = errdict.get('code', 0)
                timestamp = cls.extract_timestamp(errdict.get('ts'))
                traceback = errdict.get('traceback', NO_TRACEBACK_STR)
                info = errdict.get('value', NO_VALUE_STR)
                errors.append(
                    {
                        "code": code,
                        "service": service,
                        "node": node,
                        "robot": robot,
                        "traceback": traceback,
                        "info": info,
                        "timestamp": timestamp,
                    }
                )
        if incomplete:
            report.tags.add(Tags.INCOMPLETE.value) 
            report.save()
        return errors

    @classmethod
    def create_exceptions(cls, report, user=None):
        errors = cls._extract_exception_data(report)
        if user:
            creator = user
        else:
            creator = report.creator
        if errors is not None:
            for error in errors:
                error['report'] = report
                error['timestamp'] = error['timestamp']
                error['code'] = AFTExceptionCode.objects.get(code=error['code'])
                AFTException.objects.create(**error, creator=creator)


    class Meta:
        model = ErrorReport
        fields = ('__all__')
        read_only_fields = ('creator',)


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

   