from .filters import EventFilterset, PickSessionFilterset
from .serializers import EventSerializer, PickSessionSerializer

from rest_framework.decorators import action
from rest_framework.renderers import JSONRenderer
from common.utils import make_ok
from common.viewsets import CreateModelViewSet
from hds.roles import RoleChoices


class TaggedUUIDViewBase(CreateModelViewSet):
    ordering = ('-id',)
    view_permissions_update = {
        'get_tags': {
            RoleChoices.SUPPORT: True, #is_whitelisted,
            RoleChoices.JENKINS: True,
        }
    }

    def get_queryset(self):
        model = self.serializer_class.Meta.model
        return model.objects.all()

    @action(
        methods=["get"],
        detail=False,
        url_path="tags",
        renderer_classes=[JSONRenderer]
    )
    def get_tags(self, request):
        model = self.serializer_class.Meta.model
        queryset = model.tags.all().values_list("name", flat=True)
        return make_ok("Event tags", {"tags": list(queryset)})


class EventView(TaggedUUIDViewBase):
    filterset_class = EventFilterset
    serializer_class = EventSerializer


class PickSessionView(TaggedUUIDViewBase):
    filterset_class = PickSessionFilterset
    serializer_class = PickSessionSerializer
