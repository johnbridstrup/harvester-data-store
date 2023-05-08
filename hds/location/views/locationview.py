from common.viewsets import CreateModelViewSet
from hds.roles import RoleChoices
from ..filters import LocationFilterset
from ..models import Location
from ..serializers.locationserializer import (
    LocationSerializer,
    LocationListSerializer
)


class LocationView(CreateModelViewSet):
    queryset = Location.objects.all()
    serializer_class = LocationSerializer
    filterset_class = LocationFilterset
    view_permissions_update = {
        "create": {
            RoleChoices.DEVELOPER: True
        },
        "update": {
            RoleChoices.DEVELOPER: True,
        },
        "destroy": {
            RoleChoices.MANAGER: True,
        },
    }
    action_serializers = {
        "list": LocationListSerializer,
        "retrieve": LocationListSerializer
    }
