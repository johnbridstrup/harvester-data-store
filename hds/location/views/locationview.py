from ..models import Location
from ..serializers.locationserializer import LocationSerializer

from common.viewsets import CreateModelViewSet
from hds.roles import RoleChoices


class LocationView(CreateModelViewSet):
    queryset = Location.objects.all()
    serializer_class = LocationSerializer
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
