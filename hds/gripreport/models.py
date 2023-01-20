from common.reports import ReportBase
from event.models import EventModelMixin


class GripReport(EventModelMixin, ReportBase):
    def __str__(self):
        return f"Grip report: {self.reportTime}"
