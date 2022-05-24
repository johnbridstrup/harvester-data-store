from ..models import Distributor
from ..serializers.distributorserializer import DistributorSerializer

from rest_framework.permissions import IsAuthenticated
from common.utils import make_ok
from common.viewsets import CreateModelViewSet


class DistributorView(CreateModelViewSet):
    queryset = Distributor.objects.all()
    serializer_class = DistributorSerializer
    permission_classes = (IsAuthenticated,)

    def create(self, request, *args, **kwargs):
        response = super().create(request, *args, **kwargs)
        return make_ok("Distributor created successfully", response.data, 201)

    # update distributor
    def update(self, request, *args, **kwargs):
        response = super().update(request, *args, **kwargs)
        return make_ok("Distributor updated successfully", response.data)

    # get all distributors
    def list(self, request, *args, **kwargs):
        response = super().list(request, *args, **kwargs)
        return make_ok("Distributors retrieved successfully", response.data)

    # get distributor by id
    def retrieve(self, request, *args, **kwargs):
        response = super().retrieve(request, *args, **kwargs)
        return make_ok("Distributor retrieved successfully", response.data)

    # delete distributor
    def destroy(self, request, *args, **kwargs):
        response = super().destroy(request, *args, **kwargs)
        return make_ok("Distributor deleted successfully", response.data)