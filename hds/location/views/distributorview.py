from ..models import Distributor
from ..serializers.distributorserializer import DistributorSerializer

from rest_framework.permissions import IsAuthenticated
from common.viewsets import CreateModelViewSet


class DistributorView(CreateModelViewSet):
    queryset = Distributor.objects.all()
    serializer_class = DistributorSerializer
    permission_classes = (IsAuthenticated,)

