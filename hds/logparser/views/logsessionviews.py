from rest_framework.response import Response
from rest_framework import status
from rest_framework.decorators import action
from rest_framework.renderers import JSONRenderer
from common.async_metrics import ASYNC_UPLOAD_COUNTER
from common.viewsets import CreateModelViewSet
from common.schema import HDSToRepAutoSchema
from common.utils import make_ok, make_error
from common.fileloader import get_client
from event.models import Event
from event.serializers import EventSerializerMixin
from s3file.models import S3File, SessClip
from s3file.signals import sessclip_uploaded
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
        "upload_callback": {
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
        file_name = request.data.get("file_name", None)
        file_type = request.data.get("file_type", None)
        if file_name and file_type:
            key = f"media/uploads/{request.user.username}/{file_name}"
            client = get_client()
            UUID = Event.generate_uuid()
            event = EventSerializerMixin.get_or_create_event(
                UUID, request.user, S3File.__name__
            )
            s3file = S3File.objects.create(
                filetype="sessclip", creator=request.user, event=event, key=key
            )
            s3file.file.name = key
            s3file.save()
            SessClip.objects.create(file=s3file)
            try:
                presigned_url = client.generate_presigned_url(key, file_type)
                return Response(
                    {
                        "message": "presigned url generated successfully",
                        "presigned_url": presigned_url,
                        "s3file_id": s3file.id,
                        "status": "success",
                    }
                )
            except Exception as e:
                return Response(
                    {
                        "message": "An error occured while generating presigned url",
                        "presigned_url": None,
                        "s3file_id": s3file.id,
                        "status": "failure",
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

        return super().create(request, *args, **kwargs)

    def perform_create(self, serializer):
        super().perform_create(serializer)
        zip_id = serializer.data["id"]
        perform_extraction.delay(zip_id)

    @action(
        methods=["get"],
        detail=False,
        url_path="callback",
        renderer_classes=[JSONRenderer],
    )
    def upload_callback(self, request):
        upload_status = request.query_params.get("upload_status", None)
        s3file_id = request.query_params.get("s3file_id", None)
        if upload_status == "success" and s3file_id:
            # call the sessclip_uploaded signal
            sessclip_uploaded.send(sender=SessClip, s3file_id=s3file_id)
            return make_ok(
                "success", {"message": "upload signal queued for extraction"}
            )
        elif upload_status == "failure" and s3file_id:
            # delete the orphan s3file, event and sessclip objects
            s3file = S3File.objects.get(id=s3file_id)
            sess = SessClip.objects.get(file=s3file)
            s3file.event.delete()
            sess.delete()
            return make_ok(
                "success",
                {"message": "upload to s3 failed and orphan objects removed"},
            )
        return make_error(
            {
                "message": "missing required query params (upload_status, s3file_id)"
            }
        )
