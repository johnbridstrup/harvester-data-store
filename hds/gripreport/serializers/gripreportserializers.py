from django.contrib.auth.models import User
from django.db import transaction
from django.utils import timezone

from common.reports import DTimeFormatter, ReportBase
from common.serializers.reportserializer import ExtractionError, ReportSerializerBase
from common.serializers.userserializer import UserCustomSerializer
from event.serializers import (
    PickSessionSerializerMixin,
    EventSerializer,
    PickSessionMinimalSerializer,
)
from harvester.serializers.harvesterserializer import HarvesterMinimalSerializer
from location.serializers.locationserializer import LocationMinimalSerializer

from ..exceptions import CandExtractionError, GripExtractionError
from ..models import Candidate, Grip, GripReport


class GripReportSerializer(PickSessionSerializerMixin, ReportSerializerBase):
    MALFORMED_RESULT = "Result is malformed"

    class ExtractTags:
        CAND_DONE = "extracted-candidates"
        CAND_FAILED = "failed-extract-candidates"
        GRIP_DONE = "extracted-grips"
        GRIP_FAILED = "failed-extract-grips"
        MALFORMED = "malformed-result"
        TRUNCATED = "result-truncated"

    class Meta:
        model = GripReport
        fields = "__all__"

    def to_internal_value(self, data):
        report = data.copy()
        pick_session_start_ts = report.get("pick_session_start_time", None)
        pick_session_start_time = DTimeFormatter.from_timestamp(pick_session_start_ts)
        pick_session_end_ts = report.get("timestamp")
        pick_session_end_time = DTimeFormatter.from_timestamp(pick_session_end_ts)
        data, harv_obj = self.extract_basic(report)

        if "request" in self.context:
            creator = self.get_user_from_request()
        elif "creator" in report:
            creator = self.get_user_from_id(data["creator"])
        else:
            raise KeyError("Cannot retrieve creator.")

        # Event
        event_uuid = self.extract_uuid(report)
        event = self.get_or_create_event(event_uuid, creator, GripReport.__name__)
        data["event"] = event.id

        # Pick Session
        pick_session_uuid = self.extract_uuid(report, "pick_session_uuid")
        pick_session = self.get_or_create_picksession(
            pick_session_uuid, creator, GripReport.__name__
        )
        self.set_picksess_harv_location(pick_session, harv_obj)
        self.set_picksess_time(
            pick_session, pick_session_start_time, pick_session_end_time
        )
        data["pick_session"] = pick_session.id
        return super().to_internal_value(data)

    @classmethod
    def extract(cls, report_obj: ReportBase):
        harv = report_obj.harvester
        fruit = harv.fruit
        data = report_obj.report.get("data")

        if data is None:
            raise ExtractionError("No data in report")

        extr_cands = not report_obj.tags.filter(name=cls.ExtractTags.CAND_DONE).exists()
        extr_grips = not report_obj.tags.filter(name=cls.ExtractTags.GRIP_DONE).exists()

        if extr_cands:
            cand_list = data.get("cand")
            if cand_list is None or not isinstance(cand_list, list):
                report_obj.tags.add(cls.ExtractTags.CAND_FAILED)
                raise CandExtractionError("No candidates in report")

            cls.extract_candidates(cand_list, harv, fruit, report_obj)
            report_obj.tags.add(cls.ExtractTags.CAND_DONE)
            del data["cand"]

        if extr_grips:
            grip_list = data.get("grip")  # get a grip
            if grip_list is None or not isinstance(grip_list, list):
                report_obj.tags.add(cls.ExtractTags.GRIP_FAILED)
                raise GripExtractionError("No grips in report")

            cls.extract_grips(grip_list, harv, fruit, report_obj)
            report_obj.tags.add(cls.ExtractTags.GRIP_DONE)
            del data["grip"]

        report_obj.save()

    @classmethod
    def extract_candidates(cls, cand_list, harv, fruit, report_obj: ReportBase):
        cands = []
        try:
            with transaction.atomic():  # if the extraction fails, we roll back entirely to avoid conflicts
                for cand_dict in cand_list:
                    cands.append(cls._get_cand(cand_dict, harv, fruit, report_obj))
                    if (
                        len(cands) >= 100
                    ):  # 100 seems fine for a batch not sure what is optimal
                        Candidate.objects.bulk_create(cands)
                        cands = []

                # Create the rest
                Candidate.objects.bulk_create(cands)
        except Exception as e:
            report_obj.tags.add(cls.ExtractTags.CAND_FAILED)
            report_obj.save()
            raise CandExtractionError(f"Failed to extract candidates: {e}")

    @staticmethod
    def _get_cand(cand_dict, harv, fruit, report_obj):
        cand_id = cand_dict["cand_id"]
        robot_id = cand_dict["robot_id"]
        ripeness = cand_dict["ripeness"]
        score = cand_dict["score"]
        created = timezone.now()
        cand = Candidate(
            report=report_obj,
            fruit=fruit,
            harvester=harv,
            location=harv.location,
            robot_id=robot_id,
            score=score,
            ripeness=ripeness,
            cand_id=cand_id,
            candidate_data=cand_dict,
            creator=report_obj.creator,
            created=created,
            lastModified=created,
        )
        return cand

    @classmethod
    def extract_grips(cls, grip_list, harv, fruit, report_obj: ReportBase):
        grips = []
        try:
            with transaction.atomic():
                for grip_dict in grip_list:
                    grips.append(cls._get_grip(grip_dict, harv, fruit, report_obj))
                    if len(grips) >= 100:
                        Grip.objects.bulk_create(grips)
                        grips = []
                Grip.objects.bulk_create(grips)
        except Exception as e:
            report_obj.tags.add(cls.ExtractTags.GRIP_FAILED)
            report_obj.save()
            raise GripExtractionError(f"Failed to extract grips: {e}")

    @classmethod
    def _get_grip(cls, grip_dict, harv, fruit, report_obj):
        success = grip_dict["success"]
        robot_id = grip_dict["robot_id"]
        grip_start_ts = grip_dict["grip_start_ts"]
        grip_end_ts = grip_dict["grip_end_ts"]
        pick_result, pick_result_dirty = cls._grip_pick_dirty_check(
            grip_dict["pick_result"], report_obj
        )
        grip_result, grip_result_dirty = cls._grip_pick_dirty_check(
            grip_dict["grip_result"], report_obj
        )
        created = timezone.now()

        cand_id = grip_dict["cand_id"]
        cands = Candidate.objects.filter(
            report=report_obj, cand_id=cand_id, robot_id=robot_id
        )
        delta = 10000000
        cand = None
        for c in cands:
            if (c.candidate_data["ts"] - grip_start_ts) ** 2 < delta**2:
                delta = c.candidate_data["ts"] - grip_start_ts
                cand = c

        grip = Grip(
            report=report_obj,
            fruit=fruit,
            harvester=harv,
            location=harv.location,
            candidate=cand,
            success=success,
            robot_id=robot_id,
            grip_start_ts=grip_start_ts,
            grip_end_ts=grip_end_ts,
            pick_result=pick_result,
            pick_result_dirty=pick_result_dirty,
            grip_result=grip_result,
            grip_result_dirty=grip_result_dirty,
            grip_data=grip_dict,
            creator=report_obj.creator,
            created=created,
            lastModified=created,
        )
        return grip

    @classmethod
    def _grip_pick_dirty_check(cls, result, report: GripReport):
        if not isinstance(result, str):
            report.tags.add(GripReportSerializer.ExtractTags.MALFORMED)
            report.save()
            return cls.MALFORMED_RESULT, True

        if len(result) > 255:
            report.tags.add(GripReportSerializer.ExtractTags.TRUNCATED)
            report.save()
            return f"{result[:100]} (trunc)", True

        return result, False


class GripReportListSerializer(GripReportSerializer):
    """
    Return a response with minimal nesting to the list view
    for any related objected.
    """

    event = EventSerializer(read_only=True)
    harvester = HarvesterMinimalSerializer(read_only=True)
    location = LocationMinimalSerializer(read_only=True)
    pick_session = PickSessionMinimalSerializer(read_only=True)
    creator = UserCustomSerializer(read_only=True)
    modifiedBy = UserCustomSerializer(read_only=True)

    class Meta(GripReportSerializer.Meta):
        model = GripReport
        fields = [
            "reportTime",
            "event",
            "harvester",
            "location",
            "pick_session",
            "creator",
            "modifiedBy",
        ]


class GripReportDetailSerializer(GripReportSerializer):
    """
    Return a response with full nesting to the detail view
    for any related objected.
    """

    event = EventSerializer(read_only=True)
    harvester = HarvesterMinimalSerializer(read_only=True)
    location = LocationMinimalSerializer(read_only=True)
    pick_session = PickSessionMinimalSerializer(read_only=True)
    creator = UserCustomSerializer(read_only=True)
    modifiedBy = UserCustomSerializer(read_only=True)

    class Meta(GripReportSerializer.Meta):
        pass
