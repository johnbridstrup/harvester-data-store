from ..models import JobType
from ..serializers.jobtypeserializer import JobTypeSerializer

from rest_framework.permissions import DjangoModelPermissions
from common.viewsets import CreateModelViewSet
from hds.roles import RoleChoices


class JobTypeView(CreateModelViewSet):
    queryset = JobType.objects.all()
    serializer_class = JobTypeSerializer
    permission_classes = (DjangoModelPermissions,)
    view_permissions_update = {
        'create': {
            RoleChoices.JENKINS: True,
            RoleChoices.DEVELOPER: True,
        },
        'destroy': {
            RoleChoices.DEVELOPER: True,
        },
        'update': {
            RoleChoices.DEVELOPER: True,
        },
    }