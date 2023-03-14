from ..filters import JobSchemaFilterset
from ..models import JobSchema
from ..serializers.jobschemaserializer import JobSchemaSerializer

from rest_framework.permissions import DjangoModelPermissions
from common.viewsets import CreateModelViewSet
from hds.roles import RoleChoices


class JobSchemaView(CreateModelViewSet):
    queryset = JobSchema.objects.all()
    serializer_class = JobSchemaSerializer
    permission_classes = (DjangoModelPermissions,)
    filterset_class = JobSchemaFilterset
    ordering = ('-created',)
    view_permissions_update = {
        'create': {
            RoleChoices.JENKINS: True,
            RoleChoices.MANAGER: True,
        },
        'destroy': {
            RoleChoices.MANAGER: True
        },
    }
