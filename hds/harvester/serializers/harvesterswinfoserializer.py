from rest_framework import serializers

from common.reports import DTimeFormatter
from ..models import HarvesterSwInfo, Harvester
from ..serializers.harvesterserializer import HarvesterMinimalSerializer


class HarvesterSWInfoSerializer(serializers.ModelSerializer):
    class Meta:
        model = HarvesterSwInfo
        fields = "__all__"
        read_only_field = ["id"]

    def to_internal_value(self, data):
        raw_data = data.copy()
        internal_data = {}
        internal_data["githash"] = raw_data["version_info"]["githash"]
        internal_data["dirty"] = raw_data["version_info"]["dirty"]
        internal_data["branchname"] = raw_data["version_info"]["branchname"]
        internal_data["deployer"] = raw_data["version_info"]["deployer"]
        internal_data["deployed_ts"] = DTimeFormatter.from_timestamp(
            raw_data["version_info"]["deployed_ts"]
        )
        harv = Harvester.objects.get(harv_id=int(raw_data["serial_number"]))
        internal_data["harvester"] = harv.id
        internal_data["creator"] = self.context.get("request").user.id

        return super().to_internal_value(internal_data)


class HarvesterSWInfoListSerializer(serializers.ModelSerializer):
    harvester = HarvesterMinimalSerializer()

    class Meta:
        model = HarvesterSwInfo
        fields = "__all__"
