from ..models import Harvester
from ..serializers.harvesterserializer import HarvesterSerializer

from rest_framework.permissions import IsAuthenticated
from common.viewsets import CreateModelViewSet


class HarvesterView(CreateModelViewSet):
    queryset = Harvester.objects.all()
    serializer_class = HarvesterSerializer
    permission_classes = (IsAuthenticated,)
