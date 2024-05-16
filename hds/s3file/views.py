import re

from django.db.models import Prefetch
from rest_framework.decorators import action
from rest_framework.renderers import JSONRenderer
from rest_framework.response import Response
from rest_framework.status import HTTP_404_NOT_FOUND
from urllib.parse import urljoin

from event.signals import update_event_tag
from event.models import Event
from common.utils import make_error, make_ok
from common.viewsets import CreateModelViewSet
from hds.roles import RoleChoices
from .models import S3File, SessClip
from .serializers import S3FileSerializer, S3FileListSerializer, S3FileDetailSerializer
from .signals import sessclip_uploaded
from .filters import S3FileFilter


class S3FileView(CreateModelViewSet):
    queryset = S3File.objects.all()
    serializer_class = S3FileSerializer
    http_method_names = ["get", "delete", "post"]
    filterset_class = S3FileFilter
    ordering = ("-created",)
    view_permissions_update = {
        "create": {
            RoleChoices.SQS: True,
        },
        "destroy": {RoleChoices.MANAGER: True, RoleChoices.DEVELOPER: True},
        "download_redirect": {
            RoleChoices.SUPPORT: True,
        },
    }
    action_serializers = {
        "list": S3FileListSerializer,
        "retrieve": S3FileDetailSerializer,
    }

    def get_queryset(self):
        deleted = False
        if "deleted" in self.request.query_params:
            deleted = self.check_for_deleted(self.request.query_params.get("deleted"))
        return (
            self.queryset.filter(deleted=deleted)
            .select_related(
                "creator",
                "modifiedBy",
            )
            .prefetch_related(
                Prefetch(
                    lookup="event",
                    queryset=Event.objects.prefetch_related(
                        "secondary_events",
                        "tags",
                    ),
                )
            )
        )

    def perform_create(self, serializer):
        inst = super().perform_create(serializer)
        # FileField and django-storages allow pointing directly to the key in S3
        inst.file = inst.key
        inst.save()
        filetype = serializer.data["filetype"]
        event_id = serializer.data["event"]
        update_event_tag.send(sender=S3File, event_id=event_id, tag=filetype)
        return inst

    def destroy(self, request, *args, **kwargs):
        obj = self.get_object()
        obj.deleted = True
        obj.save()
        obj.delete_from_s3()
        return Response("s3file deleted")

    def check_for_deleted(self, qp):
        return qp in ["True", "true", "1"]

    @action(
        methods=["get"],
        detail=True,
        url_path="download",
        renderer_classes=[JSONRenderer],
    )
    def download_redirect(self, request, pk=None):
        obj = self.get_object()
        http_pattern = "^https?://"
        if obj.file:
            obj_url = obj.file.url
            if re.search(http_pattern, obj_url):
                url = obj_url
            elif request is not None:
                url = urljoin(
                    urljoin("http://" + request.get_host(), "/api/v1/"), obj_url
                )
        else:
            return make_error("File Does Not Exist", HTTP_404_NOT_FOUND)
        return make_ok(
            "Download Url Retrieved.",
            {
                "url": url,
                "id": obj.id,
            },
        )


class SessClipView(S3FileView):
    def perform_create(self, serializer):
        inst = super().perform_create(serializer)
        event_id = serializer.data["event"]
        SessClip.objects.create(file=inst)
        sessclip_uploaded.send(sender=SessClip, s3file_id=inst.id)
        update_event_tag.send(sender=SessClip, event_id=event_id, tag="sessclip")
        return inst
