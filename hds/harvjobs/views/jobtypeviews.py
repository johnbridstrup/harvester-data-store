from ..models import JobType
from ..serializers.jobtypeserializer import JobTypeSerializer

from rest_framework.permissions import DjangoModelPermissions
from common.viewsets import CreateModelViewSet


class JobTypeView(CreateModelViewSet):
    queryset = JobType.objects.all()
    serializer_class = JobTypeSerializer
    permission_classes = (DjangoModelPermissions,)