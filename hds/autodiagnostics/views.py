from rest_framework.response import Response

from common.viewsets import CreateModelViewSet, ReportModelViewSet

from .filters import AutodiagnosticsRunFilter, AutodiagnosticsReportFilter
from .models import AutodiagnosticsReport, AutodiagnosticsRun
from .serializers import (
    AutodiagnosticsReportListSerializer,
    AutodiagnosticsReportSerializer,
    AutodiagnosticsRunSerializer
)
from .tasks import extract_autodiag_run


MAGIC_GRIPPER_SN = 1297
MAGIC_GRIPPER_MSG = f'Magic gripper {MAGIC_GRIPPER_SN} ignored.'


class AutodiagnosticsReportView(ReportModelViewSet):
    queryset = AutodiagnosticsReport.objects.all()
    serializer_class = AutodiagnosticsReportSerializer
    filterset_class = AutodiagnosticsReportFilter
    list_serializer_class = AutodiagnosticsReportListSerializer

    def create(self, request, *args, **kwargs):
        gripper_sn = int(request.data['data']['serial_no'])
        if gripper_sn == MAGIC_GRIPPER_SN:
            return Response(MAGIC_GRIPPER_MSG)
        return super().create(request, *args, **kwargs)

    def perform_create(self, serializer):
        super().perform_create(serializer)
        data = serializer.data
        extract_autodiag_run.delay(data["id"])


class AutodiagnosticsRunView(CreateModelViewSet):
    queryset = AutodiagnosticsRun.objects.all()
    serializer_class = AutodiagnosticsRunSerializer
    filterset_class = AutodiagnosticsRunFilter
