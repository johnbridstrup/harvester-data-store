from common.async_metrics import ASYNC_UPLOAD_COUNTER
from common.viewsets import CreateModelViewSet
from common.schema import HDSToRepAutoSchema
from hds.roles import RoleChoices
from logparser.filters import LogSessionFilterset
from logparser.tasks import perform_extraction
from logparser.serializers.logsessionserializers import (
    LogSessionSerializer,
    LogSessionBaseSerializer,
    LogSessionDetailSerializer,
)
from logparser.models import LogSession


class LogSessionViewset(CreateModelViewSet):
    queryset = LogSession.objects.all()
    serializer_class = LogSessionBaseSerializer
    filterset_class = LogSessionFilterset
    ordering = ("-created",)
    view_permissions_update = {
        "create": {
            RoleChoices.SUPPORT: True,
        },
    }
    action_serializers = {
        "create": LogSessionSerializer,
        "retrieve": LogSessionDetailSerializer,
    }
    schema = HDSToRepAutoSchema(
        extra_info={
            "logs": {
                "type": "object",
                "properties": {
                    "harv_id": {"type": "number"},
                    "robots": {"type": "array", "items": {"type": "number"}},
                    "services": {
                        "type": "array",
                        "items": {
                            "type": "object",
                            "properties": {
                                "id": {"type": "number"},
                                "service": {"type": "string"},
                                "robot": {"type": "number"},
                            },
                        },
                    },
                    "videos": {
                        "type": "array",
                        "items": {
                            "type": "object",
                            "properties": {
                                "id": {"type": "number"},
                                "category": {"type": "string"},
                                "robot": {"type": "number"},
                            },
                        },
                    },
                },
            }
        }
    )

    def create(self, request, *args, **kwargs):
        filesize_bytes = request.headers.get("Content-Length")
        if filesize_bytes is not None:
            zip_kb = int(filesize_bytes) / 1000  # KB
            ASYNC_UPLOAD_COUNTER.labels(
                "sessclip_zip",
            ).inc(zip_kb)

        return super().create(request, *args, **kwargs)

    def perform_create(self, serializer):
        super().perform_create(serializer)
        zip_id = serializer.data["id"]
        perform_extraction.delay(zip_id)
