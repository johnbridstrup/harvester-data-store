from rest_framework import serializers
from taggit.serializers import TaggitSerializer, TagListSerializerField

from common.models import Tags
from common.reports import ReportBase
from common.serializers.reportserializer import ReportSerializerBase
from event.serializers import EventSerializerMixin
from harvester.serializers.harvesterserializer import HarvesterSerializer

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


class HarvesterAssetReportSerializer(TaggitSerializer, EventSerializerMixin, ReportSerializerBase):
    tags = TagListSerializerField(required=False)

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
        
        meta = self.extract_basic(data)

        internal_data = {
            **meta,
            "report": data,
            "tags": tags,
        }
        return super().to_internal_value(internal_data)

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data["harvester"] = HarvesterSerializer(instance.harvester).data
        return data

    @classmethod
    def extract(cls, report_obj: ReportBase):
        user = report_obj.creator
        harv = report_obj.harvester
        asset_list = report_obj.report["data"]

        for asset in asset_list:
            asset_type = asset.pop("asset")
            serial_number = asset.pop("asset-tag")
            asset["serial_number"] = serial_number
            index = asset["index"]
            version = asset.get("version", None)
            asset_type_obj = HarvesterAssetType.get_or_create(asset_type=asset_type, user=user)
            HarvesterAsset.update_or_create_and_get(asset_type_obj, harv, index, serial_number, user, version)
        
        # All report information is extracted. Delete the report.
        report_obj.delete()
    
    class Meta:
        model = HarvesterAssetReport
        fields = ('__all__')
        read_only_fields = ('creator',)