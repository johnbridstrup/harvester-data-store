from .models import Event, EventTag
from .serializers import EventSerializer

from rest_framework.decorators import action
from rest_framework.renderers import JSONRenderer
from common.utils import make_ok
from common.viewsets import CreateModelViewSet


class EventView(CreateModelViewSet):
    queryset = Event.objects.all()
    serializer_class = EventSerializer
    filterset_fields = ('UUID',)
    ordering = ('-id',)

    def get_queryset(self):
        filter_dict = {}
        if "UUID" in self.request.query_params:
            filter_dict['UUID'] = self.request.query_params.get("UUID")
        return self.queryset.filter(**filter_dict).order_by('-id').distinct()
        
    @action(
        methods=["get"],
        detail=False,
        url_path="tags",
        renderer_classes=[JSONRenderer]
    )
    def get_tags(self, request):
        queryset = Event.tags.all().values_list("name")
        tags = [tag[0] for tag in queryset]
        return make_ok("Event tags", {"tags": tags})
