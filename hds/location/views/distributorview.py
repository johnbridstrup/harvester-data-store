from ..models import Distributor
from ..serializers.distributorserializer import DistributorSerializer

from common.viewsets import CreateModelViewSet


class DistributorView(CreateModelViewSet):
    queryset = Distributor.objects.all()
    serializer_class = DistributorSerializer

