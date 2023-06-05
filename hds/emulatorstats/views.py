from common.viewsets import ReportModelViewSet

from .models import EmustatsReport
from .serializers import EmustatsReportSerializer


class EmuReportView(ReportModelViewSet):
    queryset = EmustatsReport.objects.all()
    serializer_class = EmustatsReportSerializer
    filterset_fields = (
        'runner',
        'branch',
    )