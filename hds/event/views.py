from .serializers import EventSerializer

from rest_framework.decorators import action
from rest_framework.renderers import JSONRenderer
from common.utils import make_ok
from common.viewsets import CreateModelViewSet
from hds.roles import RoleChoices


class TaggedUUIDViewBase(CreateModelViewSet):
    filterset_fields = ("UUID",)
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
        queryset = model.tags.all().values_list("name")
        tags = [tag[0] for tag in queryset]
        return make_ok("Event tags", {"tags": tags})


class EventView(TaggedUUIDViewBase):
    serializer_class = EventSerializer    
