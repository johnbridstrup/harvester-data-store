from common.filters import EventUUIDFilter, ReportFilterset

from .models import GripReport


class PickSessionReportFilterset(ReportFilterset):
    uuid = EventUUIDFilter()
    class Meta:
        model = GripReport
        fields = ReportFilterset.FIELDS_BASE + [
            'harvester__harv_id', 
            'event__UUID',
            'location__ranch',
        ]
