from ..filters import DistributorFilterset
from ..models import Distributor
from ..serializers.distributorserializer import DistributorSerializer

from common.viewsets import CreateModelViewSet
from hds.roles import RoleChoices


class DistributorView(CreateModelViewSet):
    queryset = Distributor.objects.all()
    serializer_class = DistributorSerializer
    filterset_class = DistributorFilterset
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
