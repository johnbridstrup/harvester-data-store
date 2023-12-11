from common.viewsets import CreateModelViewSet
from common.schema import HDSToRepAutoSchema
from hds.roles import RoleChoices

from ..filters import JobSchemaFilterset
from ..models import JobSchema
from ..serializers.jobschemaserializer import JobSchemaSerializer


class JobSchemaView(CreateModelViewSet):
    queryset = JobSchema.objects.all()
    serializer_class = JobSchemaSerializer
    filterset_class = JobSchemaFilterset
    ordering = ('-created')
    view_permissions_update = {
        'create': {
            RoleChoices.JENKINS: True,
            RoleChoices.MANAGER: True,
        },
        'destroy': {
            RoleChoices.MANAGER: True
        },
    }
    schema = HDSToRepAutoSchema(extra_info={
        'jobtype': {
            'type': 'string',
            'nullable': 'true'
        }
    })
