from ..models import JobSchema
from ..serializers.jobschemaserializer import JobSchemaSerializer

from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.permissions import DjangoModelPermissions
from common.viewsets import CreateModelViewSet


class JobSchemaView(CreateModelViewSet):
    queryset = JobSchema.objects.all()
    serializer_class = JobSchemaSerializer
    permission_classes = (DjangoModelPermissions,)
    filter_backends = (DjangoFilterBackend,)
    filterset_fields = ('jobtype__name',)
