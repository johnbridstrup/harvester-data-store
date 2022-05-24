from ..models import Location
from ..serializers.locationserializer import LocationSerializer
from rest_framework.viewsets import ModelViewSet

from rest_framework.permissions import IsAuthenticated
from common.utils import make_ok


class LocationView(ModelViewSet):
    queryset = Location.objects.all()
    serializer_class = LocationSerializer
    permission_classes = (IsAuthenticated,)

    def perform_create(self, serializer):
        serializer.save(creator=self.request.user)

    def create(self, request, *args, **kwargs):
        response = super().create(request, *args, **kwargs)
        return make_ok("Location created successfully", response.data, 201)

    # update harvester
    def update(self, request, *args, **kwargs):
        response = super().update(request, *args, **kwargs)
        return make_ok("Location updated successfully", response.data)

    # get all harvesters
    def list(self, request, *args, **kwargs):
        response = super().list(request, *args, **kwargs)
        return make_ok("Location retrieved successfully", response.data)

    # get harvester by id
    def retrieve(self, request, *args, **kwargs):
        response = super().retrieve(request, *args, **kwargs)
        return make_ok("Location retrieved successfully", response.data)

    # delete harvester
    def destroy(self, request, *args, **kwargs):
        response = super().destroy(request, *args, **kwargs)
        return make_ok("Location deleted successfully", response.data)