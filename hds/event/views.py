from .models import Event
from .serializers import EventSerializer

from rest_framework.permissions import IsAuthenticated
from common.viewsets import CreateModelViewSet


class EventView(CreateModelViewSet):
    queryset = Event.objects.all()
    serializer_class = EventSerializer
    permission_classes = (IsAuthenticated,)
