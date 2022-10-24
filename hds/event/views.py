from .models import Event
from .serializers import EventSerializer

from common.viewsets import CreateModelViewSet


class EventView(CreateModelViewSet):
    queryset = Event.objects.all()
    serializer_class = EventSerializer

    def get_queryset(self):
        filter_dict = {}
        if "UUID" in self.request.query_params:
            filter_dict['UUID'] = self.request.query_params.get("UUID")
        return self.queryset.filter(**filter_dict).order_by('-id').distinct()
