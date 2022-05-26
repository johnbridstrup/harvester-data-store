from ..models import Fruit
from ..serializers.fruitserializer import FruitSerializer

from rest_framework.permissions import IsAuthenticated
from common.viewsets import CreateModelViewSet
from common.renderers import HDSJSONRenderer


class FruitView(CreateModelViewSet):
    queryset = Fruit.objects.all()
    serializer_class = FruitSerializer
    permission_classes = (IsAuthenticated,)

    def perform_create(self, serializer):
        serializer.save(creator=self.request.user)
