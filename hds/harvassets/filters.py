from django_filters import rest_framework as filters

from common.filters import CommonInfoFilterset, EventUUIDFilter, ReportFilterset

from .models import HarvesterAsset, HarvesterAssetReport


class HarvesterAssetFilterset(CommonInfoFilterset):
    class Meta:
        model = HarvesterAsset
        fields = CommonInfoFilterset.FIELDS_BASE + [
            "asset__name",
            "harvester__harv_id",
            "harvester__location__ranch",
        ]


class HarvesterAssetReportFilterset(ReportFilterset):
    uuid = EventUUIDFilter()
    asset = filters.CharFilter(method="filter_by_asset")

    class Meta:
        model = HarvesterAssetReport
        fields = ReportFilterset.FIELDS_BASE

    def filter_by_asset(self, qs, name, value):
        try:
            asset_type, asset_sn = value.split(",")
        except ValueError:
            return qs

        filter_params = {
            "assets__asset__name": asset_type,
            "assets__serial_number": asset_sn,
        }
        return qs.filter(**filter_params)
