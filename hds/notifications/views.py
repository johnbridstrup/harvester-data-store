from .models import Notification
from .serializers import NotificationSerializer

from rest_framework.permissions import IsAuthenticated
from common.viewsets import CreateModelViewSet


class NotificationView(CreateModelViewSet):
    queryset = Notification.objects.all()
    serializer_class = NotificationSerializer
    permission_classes = (IsAuthenticated,)
    http_method_names = ['get', 'delete']
