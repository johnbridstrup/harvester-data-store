from common.viewsets import ReportModelViewSet

from .models import HarvesterAssetReport
from .serializers import HarvesterAssetReportSerializer
from .tasks import extract_assets


class HarvesterAssetReportView(ReportModelViewSet):
    queryset = HarvesterAssetReport.objects.all()
    serializer_class = HarvesterAssetReportSerializer

    def perform_create(self, serializer):
        super().perform_create(serializer)
        data = serializer.data
        extract_assets.delay(data['id'], data['creator'], data['harvester']['id'])