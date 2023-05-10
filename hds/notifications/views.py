from common.viewsets import CreateModelViewSet
from hds.roles import RoleChoices

from .filters import NotificationFilter
from .models import Notification
from .serializers import (
    NotificationSerializer,
    NotificationListSerializer,
    NotificationDetailSerializer
)


class NotificationView(CreateModelViewSet):
    queryset = Notification.objects.all()
    serializer_class = NotificationSerializer
    http_method_names = ['get', 'delete', 'post']
    filterset_class = NotificationFilter
    ordering = ('-id',)
    view_permissions_update = {
        "create": {
            RoleChoices.DEVELOPER: True
        },
        "update": None,
        "destroy": {
            RoleChoices.DEVELOPER: True,
        },
    }
    action_serializers = {
        "list": NotificationListSerializer,
        "retrieve": NotificationDetailSerializer
    }
