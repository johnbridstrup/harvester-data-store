from ..models import Location
from ..serializers.locationserializer import LocationSerializer

from common.viewsets import CreateModelViewSet


class LocationView(CreateModelViewSet):
    queryset = Location.objects.all()
    serializer_class = LocationSerializer

