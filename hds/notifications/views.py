from .filters import NotificationFilter
from .models import Notification
from .serializers import NotificationSerializer

from common.viewsets import CreateModelViewSet


class NotificationView(CreateModelViewSet):
    queryset = Notification.objects.all()
    serializer_class = NotificationSerializer
    http_method_names = ['get', 'delete']
    filterset_class = NotificationFilter
    ordering = ('-id',)
