

from common.viewsets import CreateModelViewSet
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

    def perform_create(self, serializer):
        super().perform_create(serializer)
        zip_id = serializer.data["id"]
        perform_extraction.delay(zip_id)
