from common.viewsets import CreateModelViewSet, ReportModelViewSet

from .filters import HarvesterAssetFilterset, HarvesterAssetReportFilterset
from .models import HarvesterAsset, HarvesterAssetReport
from .serializers import (
    HarvesterAssetReportSerializer,
    HarvesterAssetSerializer,
    HarvesterAssetReportDetailSerializer
)
from .tasks import extract_assets


class HarvesterAssetReportView(ReportModelViewSet):
    queryset = HarvesterAssetReport.objects.all()
    serializer_class = HarvesterAssetReportSerializer
    filterset_class = HarvesterAssetReportFilterset
    action_serializers = {
        "retrieve": HarvesterAssetReportDetailSerializer
    }

    def perform_create(self, serializer):
        super().perform_create(serializer)
        data = serializer.data
        extract_assets.delay(data['id'])


class HarvesterAssetView(CreateModelViewSet):
    queryset = HarvesterAsset.objects.all()
    serializer_class = HarvesterAssetSerializer
    http_allowed_methods = ["get"]
    filterset_class = HarvesterAssetFilterset
