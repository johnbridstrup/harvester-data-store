from ..models import Location
from ..serializers.locationserializer import LocationSerializer

from rest_framework.permissions import IsAuthenticated
from common.viewsets import CreateModelViewSet
from common.renderers import HDSJSONRenderer


class LocationView(CreateModelViewSet):
    queryset = Location.objects.all()
    serializer_class = LocationSerializer
    permission_classes = (IsAuthenticated,)

    def perform_create(self, serializer):
        serializer.save(creator=self.request.user)
from common.viewsets import CreateModelViewSet