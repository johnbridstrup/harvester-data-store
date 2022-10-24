from ..models import JobSchema
from ..serializers.jobschemaserializer import JobSchemaSerializer

from rest_framework.permissions import DjangoModelPermissions
from common.viewsets import CreateModelViewSet


class JobSchemaView(CreateModelViewSet):
    queryset = JobSchema.objects.all()
    serializer_class = JobSchemaSerializer
    permission_classes = (DjangoModelPermissions,)
    filterset_fields = ('jobtype__name',)
    ordering = ('-created',)
