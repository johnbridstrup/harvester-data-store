from common.viewsets import ReportModelViewSet

from .models import GripReport
from .filters import PickSessionReportFilterset
from .serializers import GripReportSerializer


class GripReportView(ReportModelViewSet):
    queryset = GripReport.objects.all()
    serializer_class = GripReportSerializer
    filterset_class = PickSessionReportFilterset
