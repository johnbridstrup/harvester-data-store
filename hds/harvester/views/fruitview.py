from ..models import Fruit
from ..serializers.fruitserializer import FruitSerializer

from rest_framework.permissions import IsAuthenticated
from common.utils import make_ok
from common.viewsets import CreateModelViewSet


class FruitView(CreateModelViewSet):
    queryset = Fruit.objects.all()
    serializer_class = FruitSerializer
    permission_classes = (IsAuthenticated,)

    def create(self, request, *args, **kwargs):
        response = super().create(request, *args, **kwargs)
        return make_ok("Fruit created successfully", response.data, 201)

    # update fruit
    def update(self, request, *args, **kwargs):
        response = super().update(request, *args, **kwargs)
        return make_ok("Fruit updated successfully", response.data)

    # get all fruits
    def list(self, request, *args, **kwargs):
        response = super().list(request, *args, **kwargs)
        return make_ok("Fruits retrieved successfully", response.data)

    # get fruit by id
    def retrieve(self, request, *args, **kwargs):
        response = super().retrieve(request, *args, **kwargs)
        return make_ok("Fruit retrieved successfully", response.data)

    # delete fruit
    def destroy(self, request, *args, **kwargs):
        response = super().destroy(request, *args, **kwargs)
        return make_ok("Fruit deleted successfully", response.data)