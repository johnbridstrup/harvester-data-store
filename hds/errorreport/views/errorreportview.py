from common.viewsets import ReportModelViewSet
from common.utils import build_frontend_url
from notifications.signals import error_report_created

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
        url = build_frontend_url(endpoint="errorreports", _id=report_id)
        error_report_created.send(sender=ErrorReport, instance_id=report_id, url=url)

    @ERRORREPORT_LIST_QUERY_TIMER.time()
    def get_queryset(self):
        queryset = super().get_queryset()
        queryset = queryset.order_by('-reportTime').distinct()
        return queryset
