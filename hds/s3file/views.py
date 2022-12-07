from .models import S3File
from .serializers import S3FileSerializer
from event.signals import update_event_tag

from django.http import FileResponse
from rest_framework.decorators import action
from rest_framework.renderers import BaseRenderer
from common.viewsets import CreateModelViewSet
from common.utils import make_ok
from hds.roles import RoleChoices

import os
import tempfile


class PassthroughRenderer(BaseRenderer):
    """
        Return data as-is. This is for mocking data downloads
    """
    media_type = ''
    format = ''
    def render(self, data, accepted_media_type=None, renderer_context=None):
        return data



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
        super().perform_create(serializer)
        filetype = serializer.data["filetype"]
        event_id = serializer.data["event"]["id"]
        update_event_tag.send(sender=S3File, event_id=event_id, tag=filetype)

    def retrieve(self, request, *args, **kwargs):
        if os.environ.get("S3_DOWNLOAD", "false") in ['True', 'true', '1']:
            instance = self.get_object()
            download_link = instance.generate_download_link()
        else:
            download_link = self.request.build_absolute_uri() + 'mock'
        return make_ok("Download Link", download_link)

    @action(
        methods=['GET'],
        detail=True,
        renderer_classes=[PassthroughRenderer],
        url_path='mock'
    )
    def download_mock(self, request, pk=None):
        """Creates a temporary file and send it in the response.
        This is purely for development.
        Args:
            request (HttpRequest): Original request object
            pk (int, optional): Needed for detail actions. Defaults to None.
        Returns:
            _type_: _description_
        """
        tmp = tempfile.NamedTemporaryFile('rb')
        response = FileResponse(tmp, content_type='application/zip')

        return response

