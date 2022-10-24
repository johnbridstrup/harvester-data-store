from .models import Event
from .serializers import EventSerializer

from common.viewsets import CreateModelViewSet


class EventView(CreateModelViewSet):
    queryset = Event.objects.all()
    serializer_class = EventSerializer
    filterset_fields = ('UUID',)
    ordering = ('-id',)
