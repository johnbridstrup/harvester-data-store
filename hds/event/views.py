from rest_framework.decorators import action
from rest_framework.renderers import JSONRenderer

from common.utils import make_ok
from common.viewsets import CreateModelViewSet
from common.schema import HDSToRepAutoSchema
from hds.roles import RoleChoices

from .models import Event, PickSession
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
    queryset = Event.objects.all()
    filterset_class = EventFilterset
    serializer_class = EventSerializer

    def get_queryset(self):
        return Event.objects.prefetch_related(
            "secondary_events",
            "tags",
            "s3file_set",
        )


class PickSessionView(TaggedUUIDViewBase):
    queryset = PickSession.objects.all()
    filterset_class = PickSessionFilterset
    serializer_class = PickSessionSerializer
    action_serializers = {
        "retrieve": PickSessionDetailSerializer
    }

    def get_queryset(self):
        if self.action == "retrieve":
            return PickSession.objects.select_related(
                "harvester",
                "location",
            ).prefetch_related("tags")
        return super().get_queryset()
