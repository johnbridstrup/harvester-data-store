from .filters import AutodiagnosticsRunFilter
from .models import AutodiagnosticsReport, AutodiagnosticsRun
from .serializers import AutodiagnosticsReportSerializer, AutodiagnosticsRunSerializer
from .tasks import extract_autodiag_run

from common.utils import make_ok
from common.viewsets import CreateModelViewSet, ReportModelViewSet

from rest_framework.response import Response


MAGIC_GRIPPER_SN = 1297
MAGIC_GRIPPER_MSG = f'Magic gripper {MAGIC_GRIPPER_SN} ignored.'


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
