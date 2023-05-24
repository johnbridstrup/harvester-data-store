from common.viewsets import ReportModelViewSet

from ..filters import ErrorReportFilterset
from ..models import ErrorReport
from ..metrics import (
    ERRORREPORT_LIST_QUERY_TIMER,
)
from ..serializers.errorreportserializer import (
    ErrorReportSerializer,
    ErrorReportListSerializer,
    ErrorReportDetailSerializer
)
from ..tasks import extract_exceptions_and_notify


class ErrorReportView(ReportModelViewSet):
    queryset = ErrorReport.objects.all()
    serializer_class = ErrorReportSerializer
    filterset_class = ErrorReportFilterset
    action_serializers = {
        "list": ErrorReportListSerializer,
        "retrieve": ErrorReportDetailSerializer
    }

    def perform_create(self, serializer):
        super().perform_create(serializer)
        report_id = serializer.data['id']
        extract_exceptions_and_notify.delay(report_id)

    @ERRORREPORT_LIST_QUERY_TIMER.time()
    def get_queryset(self):
        queryset = super().get_queryset()
        queryset = queryset.order_by('-reportTime').distinct()
        return queryset
