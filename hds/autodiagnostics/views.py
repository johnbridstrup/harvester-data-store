from .models import AutodiagnosticsReport
from .serializers import AutodiagnosticsReportSerializer

from common.viewsets import ReportModelViewSet


class AutodiagnosticsReportView(ReportModelViewSet):
    queryset = AutodiagnosticsReport.objects.all()
    serializer_class = AutodiagnosticsReportSerializer
    filterset_fields = (
        'harvester__harv_id', 
        'event__UUID',
        'location__ranch',
        'robot',
        'gripper_sn',
    )
