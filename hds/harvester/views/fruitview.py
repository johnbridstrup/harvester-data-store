from ..models import Fruit
from ..serializers.fruitserializer import FruitSerializer

from common.viewsets import CreateModelViewSet
from hds.roles import RoleChoices


class FruitView(CreateModelViewSet):
    queryset = Fruit.objects.all()
    serializer_class = FruitSerializer
    view_permissions_update = {
        "create": {
            RoleChoices.DEVELOPER: True
        },
        "destroy": {
            RoleChoices.MANAGER: True,
        },
        "update": {
            RoleChoices.DEVELOPER: True,
        },
    }

