from .filters import NotificationFilter
from .models import Notification
from .serializers import NotificationSerializer

from common.viewsets import CreateModelViewSet
from hds.roles import RoleChoices


class NotificationView(CreateModelViewSet):
    queryset = Notification.objects.all()
    serializer_class = NotificationSerializer
    http_method_names = ['get', 'delete']
    filterset_class = NotificationFilter
    ordering = ('-id',)
    view_permissions_update = {
        "create": None,
        "update": None,
        "destroy": {
            RoleChoices.DEVELOPER: True,
        },
    }
