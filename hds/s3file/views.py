from .models import S3File
from .serializers import S3FileSerializer
from event.signals import update_event_tag

from common.viewsets import CreateModelViewSet
from hds.roles import RoleChoices

class S3FileView(CreateModelViewSet):
    queryset = S3File.objects.all()
    serializer_class = S3FileSerializer
    http_method_names = ['get', 'delete', 'post']
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
