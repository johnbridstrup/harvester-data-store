from common.reports import ReportBase
from event.models import EventModelMixin


class ConfigReport(EventModelMixin, ReportBase):
    def __str__(self):
        return f"Config report: {self.reportTime}"

    class Meta:
        get_latest_by = "reportTime"
