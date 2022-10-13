from ..models import Fruit
from ..serializers.fruitserializer import FruitSerializer

from rest_framework.permissions import IsAuthenticated
from common.viewsets import CreateModelViewSet


class FruitView(CreateModelViewSet):
    queryset = Fruit.objects.all()
    serializer_class = FruitSerializer

