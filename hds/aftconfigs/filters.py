from common.filters import ReportFilterset

from .models import ConfigReport


class AFTConfigReportFilterset(ReportFilterset):
    class Meta:
        model = ConfigReport
        fields = ReportFilterset.FIELDS_BASE
