import logging
from rest_framework import serializers
from taggit.serializers import TaggitSerializer, TagListSerializerField

from common.models import Tags
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
    
    class Meta:
        model = HarvesterAssetReport
        fields = ('__all__')
        read_only_fields = ('creator',)