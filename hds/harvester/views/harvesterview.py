from ..models import Harvester
from ..serializers.harvesterserializer import HarvesterSerializer

from rest_framework.permissions import IsAuthenticated
from common.viewsets import CreateModelViewSet
from common.renderers import HDSJSONRenderer


class HarvesterView(CreateModelViewSet):
    queryset = Harvester.objects.all()
    serializer_class = HarvesterSerializer
    permission_classes = (IsAuthenticated,)

    def perform_create(self, serializer):
        serializer.save(creator=self.request.user)
