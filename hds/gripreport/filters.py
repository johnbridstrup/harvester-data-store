from common.filters import ReportFilterset

from .models import GripReport


class PickSessionReportFilterset(ReportFilterset):
    class Meta:
        model = GripReport
        fields = ReportFilterset.FIELDS_BASE + [
            'harvester__harv_id', 
            'event__UUID',
            'location__ranch',
        ]
