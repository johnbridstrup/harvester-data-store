from rest_framework.decorators import action
from rest_framework.renderers import JSONRenderer

from common.viewsets import ReportModelViewSet
from common.utils import make_ok
from hds.roles import RoleChoices

from .filters import EmustatsReportFilter
from .models import EmustatsReport
from .serializers import EmustatsReportSerializer


class EmuReportView(ReportModelViewSet):
    queryset = EmustatsReport.objects.all()
    serializer_class = EmustatsReportSerializer
    filterset_class = EmustatsReportFilter
    view_permissions_update = {
        'tags_view': {
            RoleChoices.SUPPORT: True
        }
    }


    @action(
        methods=['GET'],
        url_path='tags',
        detail=False,
        renderer_classes=[JSONRenderer]
    )
    def tags_view(self, request, pk=None):
        queryset = EmustatsReport.tags.all().values_list("name", flat=True)
        return make_ok(
            "emulatorstats tags retrieved successfully",
            {'tags': list(queryset)}
        )
