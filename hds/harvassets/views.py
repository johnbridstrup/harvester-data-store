from common.viewsets import ReportModelViewSet

from .models import HarvesterAssetReport
from .serializers import HarvesterAssetReportSerializer


class HarvesterAssetReportView(ReportModelViewSet):
    queryset = HarvesterAssetReport.objects.all()
    serializer_class = HarvesterAssetReportSerializer
