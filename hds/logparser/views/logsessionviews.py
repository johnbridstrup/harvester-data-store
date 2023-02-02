from common.async_metrics import ASYNC_UPLOAD_COUNTER
from common.viewsets import CreateModelViewSet
from hds.roles import RoleChoices
from logparser.tasks import perform_extraction
from logparser.serializers.logsessionserializers import (
    LogSessionSerializer,
)
from logparser.models import LogSession


class LogSessionViewset(CreateModelViewSet):
    queryset = LogSession.objects.all()
    serializer_class = LogSessionSerializer
    filterset_fields = ('harv__harv_id',)
    ordering = ("-created",)
    view_permissions_update = {
        "create": {
            RoleChoices.SUPPORT: True,
        },
    }

    def create(self, request, *args, **kwargs):
        filesize_bytes = request.headers.get('Content-Length')
        if filesize_bytes is not None:
            zip_kb = int(filesize_bytes) / 1000  # KB
            ASYNC_UPLOAD_COUNTER.labels(
                'sessclip_zip',
            ).inc(zip_kb)
        
        return super().create(request, *args, **kwargs)

    def perform_create(self, serializer):
        super().perform_create(serializer)
        zip_id = serializer.data["id"]
        perform_extraction.delay(zip_id)
