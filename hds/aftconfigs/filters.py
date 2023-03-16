from common.filters import EventUUIDFilter, ReportFilterset

from .models import ConfigReport


class AFTConfigReportFilterset(ReportFilterset):
    uuid = EventUUIDFilter()
    class Meta:
        model = ConfigReport
        fields = ReportFilterset.FIELDS_BASE
