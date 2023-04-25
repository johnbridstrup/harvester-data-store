from rest_framework.response import Response

from event.signals import update_event_tag
from common.viewsets import CreateModelViewSet
from hds.roles import RoleChoices
from .models import S3File, SessClip
from .serializers import S3FileSerializer
from .signals import sessclip_uploaded
from .filters import S3FileFilter

class S3FileView(CreateModelViewSet):
    queryset = S3File.objects.all()
    serializer_class = S3FileSerializer
    http_method_names = ['get', 'delete', 'post']
    filterset_class = S3FileFilter
    ordering = ('-created', )
    view_permissions_update = {
        "create": {
            RoleChoices.SQS: True,
        },
        "destroy": {
            RoleChoices.MANAGER: True,
            RoleChoices.DEVELOPER: True
        },
    }

    def get_queryset(self):
        deleted = False
        if "deleted" in self.request.query_params:
            deleted = self.check_for_deleted(
                self.request.query_params.get("deleted")
            )
        return self.queryset.filter(deleted=deleted)

    def perform_create(self, serializer):
        inst = super().perform_create(serializer)
        # FileField and django-storages allow pointing directly to the key in S3
        inst.file = inst.key
        inst.save()
        filetype = serializer.data["filetype"]
        event_id = serializer.data["event"]["id"]
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


class SessClipView(S3FileView):
    def perform_create(self, serializer):
        inst = super().perform_create(serializer)
        event_id = serializer.data["event"]["id"]
        sessclip_uploaded.send(sender=SessClip, s3file_id=inst.id)
        update_event_tag.send(sender=SessClip, event_id=event_id, tag="sessclip")
        return inst
