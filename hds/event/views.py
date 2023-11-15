from rest_framework.decorators import action
from rest_framework.renderers import JSONRenderer

from common.utils import make_ok
from common.viewsets import CreateModelViewSet
from common.schema import HDSToRepAutoSchema
from hds.roles import RoleChoices

from .filters import EventFilterset, PickSessionFilterset
from .serializers import (
    EventSerializer,
    PickSessionSerializer,
    PickSessionDetailSerializer
)


class TaggedUUIDViewBase(CreateModelViewSet):
    ordering = ('-id',)
    view_permissions_update = {
        'get_tags': {
            RoleChoices.SUPPORT: True, #is_whitelisted,
            RoleChoices.JENKINS: True,
        },
        'destroy': {
            RoleChoices.BEATBOX: True, # Beatbox creates and deletes these as part of CI
        }
    }
    schema = HDSToRepAutoSchema(extra_info={
        'related_objects': {
            'type': 'array',
            'items': {
                'type': 'object',
                'properties': {
                    'url': {
                        'type': 'string'
                    },
                    'object': {
                        'type': 'string'
                    }
                }
            }
        },
        'related_files': {
            'type': 'array',
            'items': {
                'type': 'object',
                'properties': {
                    'url': {
                        'type': 'string'
                    },
                    'filetype': {
                        'type': 'string'
                    }
                }
            }
        },
        'related_images': {
            'type': 'array',
            'items': {
                'type': 'object',
                'properties': {
                    'url': {
                        'type': 'string'
                    },
                    'filetype': {
                        'type': 'string'
                    }
                }
            }
        }
    })

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
    action_serializers = {
        "retrieve": PickSessionDetailSerializer
    }
