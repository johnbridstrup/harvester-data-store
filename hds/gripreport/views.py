from rest_framework import status
from rest_framework.response import Response

from common.viewsets import ReportModelViewSet

from .models import GripReport
from .filters import PickSessionReportFilterset
from .serializers.gripreportserializers import (
    GripReportSerializer,
    GripReportDetailSerializer,
    GripReportListSerializer,
)
from .tasks import download_gripreport


class GripReportView(ReportModelViewSet):
    queryset = GripReport.objects.all()
    serializer_class = GripReportSerializer
    filterset_class = PickSessionReportFilterset
    action_serializers = {
        "retrieve": GripReportDetailSerializer,
        "list": GripReportListSerializer,
    }

    def create(self, request, *args, **kwargs):
        event = request.data
        download_gripreport.delay(event, creator=request.user.id)
        return Response(status=status.HTTP_202_ACCEPTED)
