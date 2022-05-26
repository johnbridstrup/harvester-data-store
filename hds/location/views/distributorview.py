from ..models import Distributor
from ..serializers.distributorserializer import DistributorSerializer

from rest_framework.permissions import IsAuthenticated
from common.viewsets import CreateModelViewSet
from common.renderers import HDSJSONRenderer


class DistributorView(CreateModelViewSet):
    queryset = Distributor.objects.all()
    serializer_class = DistributorSerializer
    permission_classes = (IsAuthenticated,)

    def perform_create(self, serializer):
        serializer.save(creator=self.request.user)
    
