from common.reports import ReportBase
from event.models import PickSessionModelMixin


class GripReport(PickSessionModelMixin, ReportBase):
    def __str__(self):
        return f"Grip report: {self.reportTime}"
