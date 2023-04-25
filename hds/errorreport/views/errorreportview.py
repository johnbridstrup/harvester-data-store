from common.viewsets import ReportModelViewSet
from common.utils import make_ok, build_frontend_url
from hds.roles import RoleChoices
from notifications.signals import error_report_created
from notifications.serializers import NotificationSerializer
from rest_framework.decorators import action
from rest_framework.renderers import JSONRenderer

from ..utils import (
    build_list_filter,
)
from ..filters import ErrorReportFilterset
from ..models import ErrorReport
from ..metrics import (
    ERRORREPORT_LIST_QUERY_TIMER,
)
from ..serializers.errorreportserializer import (
    ErrorReportSerializer,
    ErrorReportListSerializer,
)


class ErrorReportView(ReportModelViewSet):
    queryset = ErrorReport.objects.all()
    serializer_class = ErrorReportSerializer
    filterset_class = ErrorReportFilterset
    view_permissions_update = {
        'create_notification': {
            RoleChoices.DEVELOPER: True,
        },
    }

    def get_serializer_class(self):
        if self.action == 'list':
            return ErrorReportListSerializer
        return ErrorReportSerializer

    def perform_create(self, serializer):
        super().perform_create(serializer)
        report_id = serializer.data['id']
        url = build_frontend_url(endpoint="errorreports", _id=report_id)
        error_report_created.send(sender=ErrorReport, instance_id=report_id, url=url)

    @ERRORREPORT_LIST_QUERY_TIMER.time()
    def get_queryset(self):
        listfilter = build_list_filter(self.request)
        harvs = ErrorReport.objects.filter(**listfilter).order_by('-reportTime').distinct()
        return harvs

    @action(
        methods=['Post'],
        url_path='createnotification',
        detail=False,
        renderer_classes=[JSONRenderer]
    )
    def create_notification(self, request):
        criteria = build_list_filter(request)
        trigger_on = ErrorReport.__name__
        recipients = request.data.get("recipients")
        notification = {
            "criteria": criteria,
            "trigger_on": trigger_on,
            "recipients": recipients
        }

        serializer = NotificationSerializer(data=notification)
        serializer.is_valid()
        serializer.save(creator=request.user)
        return make_ok("Notification created", serializer.data)

