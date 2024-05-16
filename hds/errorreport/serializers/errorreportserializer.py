import structlog

from collections.abc import Mapping
from rest_framework import serializers
from taggit.serializers import TagListSerializerField, TaggitSerializer

from common.async_metrics import ASYNC_ERROR_COUNTER
from common.models import Tags
from common.serializers.reportserializer import ReportSerializerBase
from common.serializers.userserializer import UserCustomSerializer
from event.models import PickSession
from event.serializers import (
    PickSessionSerializerMixin,
    EventSerializer,
    PickSessionMinimalSerializer,
)
from exceptions.models import AFTException, AFTExceptionCode
from exceptions.serializers import AFTExceptionListSerializer
from exceptions.utils import sort_exceptions
from harvester.serializers.harvesterserializer import HarvesterMinimalSerializer
from location.serializers.locationserializer import LocationMinimalSerializer

from ..models import ErrorReport, DEFAULT_UNKNOWN


logger = structlog.get_logger(__name__)


NO_TRACEBACK_STR = "No Traceback Available (HDS)"
NO_VALUE_STR = "No Value Available (HDS)"
FAILED_SPLIT_MSG = "Failed to split into service and index"
EXC_EXT_FAIL_MSG = "Error extracting exceptions"


class ErrorReportSerializer(
    TaggitSerializer, PickSessionSerializerMixin, ReportSerializerBase
):
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
            },
            # These properties have already been hard-coded elsewhere
            # and are used explicitly by hds
            "properties": {
                "fruit": {"type": "string"},
                "is_emulator": {"type": "boolean"},
                "scene": {"type": ["string", "null"]},
                "serial_number": {"type": ["number", "string"]},
            },
            "required": ["serial_number"],
        },
        "uuid": {
            "type": "string",
        },
    }
    REPORT_DATA_REQUIRED = [
        "sysmon_report",
    ]

    # Serializer fields
    exceptions = AFTExceptionListSerializer(many=True, required=False)
    tags = TagListSerializerField(required=False)

    def to_internal_value(self, data):
        report = data.copy()
        harv_id = self.get_serial_number(report)
        harvester = self.get_harvester(harv_id, report["data"]["sysmon_report"])
        reportTime = self.extract_timestamp(report)
        githash = report["data"].get("githash") or DEFAULT_UNKNOWN
        gitbranch = report["data"].get("branch_name") or DEFAULT_UNKNOWN

        creator = self.get_user_from_request()
        UUID = self.extract_uuid(report)
        pick_session_uuid = self.extract_uuid(report, "pick_session_uuid")
        event = self.get_or_create_event(UUID, creator, ErrorReport.__name__)
        pick_session = self.get_or_create_picksession(
            pick_session_uuid, creator, PickSession.__name__
        )

        data = {
            "harvester": harvester.id,
            "location": harvester.location.id,
            "reportTime": reportTime,
            "report": report,
            "UUID": UUID,
            "githash": githash,
            "gitbranch": gitbranch,
            "pick_session": pick_session.id,
            "event": event.id,
        }
        return super().to_internal_value(data)

    @classmethod
    def _extract_exception_data(cls, report):
        sysmon_report = report.report["data"]["sysmon_report"]
        errors = []
        incomplete = False
        for key, sysmon_entry in sysmon_report.items():
            if not isinstance(sysmon_entry, Mapping):
                logger.info(f"Skipping sysmon entry", key=key, val=sysmon_entry)
                continue
            for serv, errdict in sysmon_entry.get("errors", {}).items():
                try:
                    service, index = serv.split(".")
                except ValueError as e:
                    logger.exception(FAILED_SPLIT_MSG, key=serv)
                    ASYNC_ERROR_COUNTER.labels(
                        "_extract_exception_data", ValueError.__name__, FAILED_SPLIT_MSG
                    ).inc()
                    incomplete = True
                    continue
                robot = sysmon_entry.get("robot_index", index)
                node = sysmon_entry.get("index", index)
                code = errdict.get("code", 0)
                timestamp = cls.extract_timestamp(errdict, key="ts")
                traceback = errdict.get("traceback", NO_TRACEBACK_STR)
                info = errdict.get("value", NO_VALUE_STR)
                handled = errdict.get("handled", False)
                errors.append(
                    {
                        "code": code,
                        "service": service,
                        "node": node,
                        "robot": robot,
                        "traceback": traceback,
                        "info": info,
                        "timestamp": timestamp,
                        "handled": handled,
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
                error["report"] = report
                error["timestamp"] = error["timestamp"]
                error["code"] = AFTExceptionCode.objects.get(code=error["code"])
                exceptions.append(
                    AFTException.objects.create(**error, creator=creator, primary=False)
                )

            sorted_excs = sort_exceptions(exceptions)
            if len(sorted_excs) > 0:
                sorted_excs[0].primary = True
                sorted_excs[0].save()

    class Meta:
        model = ErrorReport
        fields = "__all__"
        read_only_fields = ("creator",)


class ErrorReportListSerializer(serializers.ModelSerializer):
    # Serializer fields
    exceptions = AFTExceptionListSerializer(many=True)
    tags = TagListSerializerField()
    harvester = HarvesterMinimalSerializer()
    location = LocationMinimalSerializer()

    class Meta:
        model = ErrorReport
        fields = (
            "id",
            "reportTime",
            "harvester",
            "location",
            "gitbranch",
            "githash",
            "event",
            "exceptions",
            "tags",
        )


class ErrorReportDetailSerializer(ErrorReportSerializer):
    """
    This serializer return a response with full nesting to the detail view
    for any related objected.
    """

    event = EventSerializer(read_only=True)
    pick_session = PickSessionMinimalSerializer(read_only=True)
    location = LocationMinimalSerializer(read_only=True)
    harvester = HarvesterMinimalSerializer(read_only=True)
    exceptions = AFTExceptionListSerializer(many=True)
    tags = TagListSerializerField()
    creator = UserCustomSerializer(read_only=True)
    modifiedBy = UserCustomSerializer(read_only=True)

    class Meta(ErrorReportSerializer.Meta):
        pass
