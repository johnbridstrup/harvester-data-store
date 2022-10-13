from ..models import Location
from ..serializers.locationserializer import LocationSerializer

from rest_framework.permissions import IsAuthenticated
from common.viewsets import CreateModelViewSet


class LocationView(CreateModelViewSet):
    queryset = Location.objects.all()
    serializer_class = LocationSerializer

