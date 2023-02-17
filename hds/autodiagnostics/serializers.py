from rest_framework import serializers
from taggit.serializers import TaggitSerializer

from common.models import Tags
from common.reports import ReportBase
from common.serializers.reportserializer import ExtractionError, ReportSerializerBase
from event.serializers import PickSessionSerializerMixin
from harvassets.models import HarvesterAsset, HarvesterAssetType

from .models import AutodiagnosticsReport, AutodiagnosticsRun


GRIPPER_ASSET_NAME = "gripper"


class AutodiagnosticsRunSerializer(serializers.ModelSerializer):
    class Meta:
        model = AutodiagnosticsRun
        fields = ('__all__')
        read_only_fields = ('creator',)


class AutodiagnosticsReportSerializer(TaggitSerializer, PickSessionSerializerMixin, ReportSerializerBase):
    run_data = AutodiagnosticsRunSerializer(read_only=True)
    class Meta:
        model = AutodiagnosticsReport
        fields = ('__all__')
        read_only_fields = ('creator',)

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
        data = self.extract_basic(data)
        result = report["data"].get("passed_autodiag")
        robot_id = report["data"].get("robot_id")
        gripper_sn = report["data"].get("serial_no")
        pick_session_uuid = self.extract_uuid(report, "pick_session_uuid")
        UUID = self.extract_uuid(report)

        data.update({
            "result": result,
            "robot": robot_id,
            "gripper_sn": gripper_sn,
            "tags": tags,
            "pick_session_uuid": pick_session_uuid,
            "UUID": UUID,
        })
        return super().to_internal_value(data)
    
    @classmethod
    def extract(cls, report_obj: ReportBase):
        creator = report_obj.creator
        report = report_obj.report
        data = report.get("data")
        if data is None:
            report.tags.add(Tags.INCOMPLETE.value)
            report.save()
            raise ExtractionError(f"Autodiagnostics report {report_obj.id} has no data")
        
        # Retrieve or create gripper HarvesterAssetType.
        # We can do this regardless of whether we can extract the actual gripper asset
        gripper_asset_type = HarvesterAssetType.get_or_create(GRIPPER_ASSET_NAME, creator)

        # Get gripper serial number
        gripper_sn = data.pop("serial_no", None)
        if gripper_sn is None:
            gripper_sn = data.pop("serial_number", None)
            if gripper_sn is None:
                report.tags.add(Tags.INCOMPLETE.value)
                report.tags.add(Tags.MISSINGVALUE.value)
                report.save()
                raise ExtractionError(f"No gripper serial number in autodiag report {report_obj.id}")
        
        # Get robot ID
        robot_id = data.pop("robot_id", None)
        if robot_id is None:
            report.tags.add(Tags.INCOMPLETE.value)
            report.tags.add(Tags.MISSINGVALUE.value)
            report.save()
            raise ExtractionError(f"No robot ID in autodiag report {report_obj.id}")

        # Update or create the gripper HarvesterAsset
        gripper = HarvesterAsset.update_or_create_and_get(
            gripper_asset_type, 
            report_obj.harvester,
            robot_id,
            gripper_sn,
            creator,
        )

        # Create HarvesterAutodiagnosticsRun
        autodiag_run = {}

        # Basic
        autodiag_run["gripper"] = gripper
        autodiag_run["robot_id"] = robot_id
        autodiag_run["creator"] = creator
        autodiag_run["report"] = report_obj
        autodiag_run["run_timestamp"] = cls.extract_timestamp(data, "ts", pop=True)

        # Boolean results
        autodiag_run["result"] = data.pop("passed_autodiag") # This and the following are the only guaranteed non-null
        autodiag_run["ball_found_result"] = data.pop("passed_autodiag_ball_found")
        autodiag_run["template_match_result"] = data.pop("passed_autodiag_template_match", None)

        # Threshold values
        autodiag_run["min_vac"] = data.pop("min_vac", None)
        autodiag_run["finger_open_value"] = data.pop("finger_open_value", None)
        autodiag_run["finger_closed_value"] = data.pop("finger_closed_value", None)
        autodiag_run["finger_delta"] = data.pop("delta_fing", None)
        autodiag_run["nominal_touch_force"] = data.pop("no_touch_force", None)
        autodiag_run["max_touch_force"] = data.pop("max_touch_val")
        autodiag_run["template_match_y_error"] = data.pop("tm_y_error", None)

        # Sensor curves
        autodiag_run["sensors"] = data.pop("sensors", {})

        # Create and save    
        run = AutodiagnosticsRun(**autodiag_run)
        run.save()

        # Update report with any leftover additional data
        report['data'] = data
        report_obj.report = report
        report_obj.save()
        return "Extracted Autodiagnostics Run"
