from common.viewsets import CreateModelViewSet
from hds.roles import RoleChoices

from ..filters import FruitFilterset
from ..models import Fruit
from ..serializers.fruitserializer import FruitSerializer


class FruitView(CreateModelViewSet):
    queryset = Fruit.objects.all()
    serializer_class = FruitSerializer
    filterset_class = FruitFilterset
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

