from .models import S3File, SessClip
from .serializers import S3FileSerializer
from .signals import sessclip_uploaded
from .filters import S3FileFilter
from event.signals import update_event_tag

from common.viewsets import CreateModelViewSet
from hds.roles import RoleChoices

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
        },
    }

    def perform_create(self, serializer):
        inst = super().perform_create(serializer)
        # FileField and django-storages allow pointing directly to the key in S3
        inst.file = inst.key
        inst.save()
        filetype = serializer.data["filetype"]
        event_id = serializer.data["event"]["id"]
        update_event_tag.send(sender=S3File, event_id=event_id, tag=filetype)
        return inst


class SessClipView(S3FileView):
    def perform_create(self, serializer):
        inst = super().perform_create(serializer)
        event_id = serializer.data["event"]["id"]
        sessclip_uploaded.send(sender=SessClip, s3file_id=inst.id)
        update_event_tag.send(sender=SessClip, event_id=event_id, tag="sessclip")
        return inst
