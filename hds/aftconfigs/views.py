from common.viewsets import ReportModelViewSet

from .models import ConfigReport
from .serializers import (
    ConfigReportSerializer,
    ConfigReportDetailSerializer
)


class ConfigReportView(ReportModelViewSet):
    queryset = ConfigReport.objects.all()
    serializer_class = ConfigReportSerializer
    filterset_fields = (
        'harvester__harv_id',
        'event__UUID',
        'location__ranch',
    )
    action_serializers = {
        "retrieve": ConfigReportDetailSerializer
    }
