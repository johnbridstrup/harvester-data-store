from common.filters import CommonInfoFilterset, EventUUIDFilter, ReportFilterset

from .models import HarvesterAsset, HarvesterAssetReport, HarvesterAssetType


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
    class Meta:
        model = HarvesterAssetReport
        fields = ReportFilterset.FIELDS_BASE