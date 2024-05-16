from ..filters import JobTypeFilterset
from ..models import JobType
from ..serializers.jobtypeserializer import JobTypeSerializer

from common.viewsets import CreateModelViewSet
from hds.roles import RoleChoices


class JobTypeView(CreateModelViewSet):
    queryset = JobType.objects.all()
    serializer_class = JobTypeSerializer
    filterset_class = JobTypeFilterset
    view_permissions_update = {
        "create": {
            RoleChoices.JENKINS: True,
            RoleChoices.MANAGER: True,
        },
        "destroy": {
            RoleChoices.MANAGER: True,
        },
        "update": {
            RoleChoices.MANAGER: True,
        },
    }
