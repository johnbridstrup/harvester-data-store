from ..models import Harvester
from ..serializers.harvesterserializer import HarvesterSerializer

from rest_framework.permissions import IsAuthenticated
from common.utils import make_ok
from common.viewsets import CreateModelViewSet


class HarvesterView(CreateModelViewSet):
    queryset = Harvester.objects.all()
    serializer_class = HarvesterSerializer
    permission_classes = (IsAuthenticated,)

    def create(self, request, *args, **kwargs):
        response = super().create(request, *args, **kwargs)
        return make_ok("Harvester created successfully", response.data, 201)

    # update harvester
    def update(self, request, *args, **kwargs):
        response = super().update(request, *args, **kwargs)
        return make_ok("Harvester updated successfully", response.data)

    # get all harvesters
    def list(self, request, *args, **kwargs):
        response = super().list(request, *args, **kwargs)
        return make_ok("Harvesters retrieved successfully", response.data)

    # get harvester by id
    def retrieve(self, request, *args, **kwargs):
        response = super().retrieve(request, *args, **kwargs)
        return make_ok("Harvester retrieved successfully", response.data)

    # delete harvester
    def destroy(self, request, *args, **kwargs):
        response = super().destroy(request, *args, **kwargs)
        return make_ok("Harvester deleted successfully", response.data)