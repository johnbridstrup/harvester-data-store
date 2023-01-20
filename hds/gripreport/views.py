from common.viewsets import ReportModelViewSet

from .models import GripReport
from .serializers import GripReportSerializer


class GripReportView(ReportModelViewSet):
    queryset = GripReport.objects.all()
    serializer_class = GripReportSerializer
    filterset_fields = (
        'harvester__harv_id', 
        'event__UUID',
        'location__ranch',
    )
