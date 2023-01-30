import logging
from django.utils import timezone
from rest_framework import serializers
from taggit.serializers import TaggitSerializer, TagListSerializerField

from common.models import Tags
from common.reports import ReportBase
from common.serializers.reportserializer import ReportSerializerBase
from event.serializers import EventSerializerMixin
from harvester.models import Harvester
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
        
        # First, clear the harvesters existing assets
        try:
            exist_assests = harv.assets.all()
            for exist_asset_obj in exist_assests:
                exist_asset_obj.harvester = None
                exist_asset_obj.save()
        except AttributeError:
            pass

        for asset in asset_list:
            asset_type = asset.pop("asset")
            serial_number = asset.pop("asset-tag")
            asset["serial_number"] = serial_number
            index = asset["index"]
            version = asset.get("version", None)
            try:
                asset_type_obj = HarvesterAssetType.objects.get(name=asset_type)
            except HarvesterAssetType.DoesNotExist:
                # create asset type and asset, then continue loop
                asset_type_obj = HarvesterAssetType.objects.create(creator=user, name=asset_type)
                HarvesterAsset.objects.create(**asset, creator=user, asset=asset_type_obj, harvester=harv)
                continue

            # check if asset exists and update, otherwise create it
            try:
                asset_obj = HarvesterAsset.objects.get(asset=asset_type_obj, serial_number=serial_number)
                asset_obj.harvester = harv
                asset_obj.index = index
                asset_obj.version = version
                asset_obj.lastModified = timezone.now()
                asset_obj.modifiedBy = user
                asset_obj.save()
            
            except HarvesterAsset.DoesNotExist:
                HarvesterAsset.objects.create(**asset, creator=user, asset=asset_type_obj, harvester=harv)
        
        # All report information is extracted. Delete the report.
        report_obj.delete()
    
    class Meta:
        model = HarvesterAssetReport
        fields = ('__all__')
        read_only_fields = ('creator',)