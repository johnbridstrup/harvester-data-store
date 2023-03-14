from ..utils import (
    build_list_filter, 
    pareto_list_filter,
    create_pareto,
)
from ..filters import ErrorReportFilterset
from ..models import ErrorReport
from ..metrics import (
    ERRORREPORT_LIST_QUERY_TIMER,
)
from ..serializers.errorreportserializer import (
    ErrorReportSerializer,
    ErrorReportListSerializer,
    ParetoSerializer,
)
from common.viewsets import ReportModelViewSet
from common.utils import make_ok, build_frontend_url
from hds.roles import RoleChoices
from notifications.signals import error_report_created
from notifications.serializers import NotificationSerializer
from django.utils.decorators import method_decorator
from django.views.decorators.cache import cache_page
from rest_framework.decorators import action
from rest_framework.renderers import JSONRenderer


class ErrorReportView(ReportModelViewSet):
    queryset = ErrorReport.objects.all()
    serializer_class = ErrorReportSerializer
    filterset_class = ErrorReportFilterset
    view_permissions_update = {
        'pareto': {
            RoleChoices.SUPPORT: True, #is_whitelisted
        },
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
        methods=['get'],
        url_path='pareto',
        detail=False,
        renderer_classes=[JSONRenderer],
    )
    @method_decorator(cache_page(60*20))
    def pareto(self, request):
        listfilter = pareto_list_filter(request)

        pareto_group = request.query_params.get("aggregate_query", "code__code")
        pareto_name = request.query_params.get("aggregate_name", None)

        query_set = create_pareto(pareto_group, listfilter)
        return make_ok(
            f"Pareto generated: {pareto_name if pareto_name else 'Exceptions'}",
            ParetoSerializer(query_set, many=True, new_name=pareto_name).data
        )

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

