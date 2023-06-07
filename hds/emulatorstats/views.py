from common.viewsets import ReportModelViewSet

from .filters import EmustatsReportFilter
from .models import EmustatsReport
from .serializers import EmustatsReportSerializer


class EmuReportView(ReportModelViewSet):
    queryset = EmustatsReport.objects.all()
    serializer_class = EmustatsReportSerializer
    filterset_class = EmustatsReportFilter