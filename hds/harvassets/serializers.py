from rest_framework import serializers
from taggit.serializers import TaggitSerializer, TagListSerializerField

from common.models import Tags
from common.reports import ReportBase
from common.serializers.reportserializer import ReportSerializerBase
from common.serializers.userserializer import UserCustomSerializer
from event.serializers import PickSessionSerializerMixin, EventSerializer
from harvester.serializers.harvesterserializer import HarvesterSerializer

from .metrics import MISSING_SERIAL_NUMBER
from .models import HarvesterAssetReport, HarvesterAssetType, HarvesterAsset


class HarvesterAssetTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = HarvesterAssetType
        fields = ('__all__')
        read_only_fields = ('creator',)


class HarvesterAssetSerializer(serializers.ModelSerializer):
    asset = HarvesterAssetTypeSerializer(read_only=True)

    class Meta:
        model = HarvesterAsset
        fields = ('__all__')
        read_only_fields = ('creator',)


class HarvesterAssetReportSerializer(TaggitSerializer, PickSessionSerializerMixin, ReportSerializerBase):
    tags = TagListSerializerField(required=False)
    assets = HarvesterAssetSerializer(many=True, read_only=True)

    @property
    def data_schema(self):
        return {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "asset": {"type": "string"},
                    "index": {"type": ["number", "string"]},
                    "asset-tag": {"type": ["number", "string"]},
                    "version": {"type": ["number", "string", "null"]},
                },
                "required": ["asset", "index", "asset-tag"],
            },
        }

    def to_internal_value(self, data):
        try:
            self.validate_incoming_report(data)
            tags = []
        except serializers.ValidationError:
            # We've already logged the failure, continue trying anyway...
            tags = [Tags.INVALIDSCHEMA.value]

        meta, _ = self.extract_basic(data)
        creator = self.get_user_from_request()
        event_uuid = self.extract_uuid(data)
        picksess_uuid = self.extract_uuid(data, key="pick_session_uuid", allow_null=True)
        event = self.get_or_create_event(event_uuid, creator, HarvesterAssetReport.__name__)

        internal_data = {
            **meta,
            "report": data,
            "tags": tags,
            "event": event.id,
        }
        if picksess_uuid:
            picksess = self.get_or_create_picksession(picksess_uuid, creator, HarvesterAssetReport.__name__)
            internal_data["pick_session"] = picksess.id
        return super().to_internal_value(internal_data)

    @classmethod
    def extract(cls, report_obj: ReportBase):
        user = report_obj.creator
        harv = report_obj.harvester
        asset_list = report_obj.report["data"]

        for asset in asset_list:
            index = asset["index"]
            asset_type = asset.pop("asset")
            serial_number = asset.pop("asset-tag", None)
            if serial_number is None:
                MISSING_SERIAL_NUMBER.labels(harv.harv_id, index, asset_type).set(1)
                continue
            else:
                MISSING_SERIAL_NUMBER.labels(harv.harv_id, index, asset_type).set(0)

            asset["serial_number"] = serial_number

            version = asset.get("version", None)
            asset_type_obj = HarvesterAssetType.get_or_create(asset_type=asset_type, user=user)
            asset_obj = HarvesterAsset.update_or_create_and_get(asset_type_obj, harv, index, serial_number, user, version)
            report_obj.assets.add(asset_obj)

        # Save the report
        report_obj.save()

    class Meta:
        model = HarvesterAssetReport
        fields = ('__all__')
        read_only_fields = ('creator',)


class HarvesterAssetReportDetailSerializer(HarvesterAssetReportSerializer):
    """
    Return a response with full nesting to the detail view
    for any related objected
    """

    harvester = HarvesterSerializer(read_only=True)
    event = EventSerializer(read_only=True)
    creator = UserCustomSerializer(read_only=True)
    modifiedBy = UserCustomSerializer(read_only=True)

    class Meta(HarvesterAssetReportSerializer.Meta):
        pass