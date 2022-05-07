from ..models import Fruit
from ..serializers.fruitserializer import FruitSerializer
from rest_framework.generics import CreateAPIView
from rest_framework.permissions import IsAuthenticated
from common.utils import sendresponse


class FruitView(CreateAPIView):
    queryset = Fruit.objects.all()
    serializer_class = FruitSerializer
    permission_classes = (IsAuthenticated,)

    def post(self, request):
        try:
            message = {}
            if "name" not in request.data.keys():
                message = {**message, **{"missing_parameter": "fruit name is required"}}
                raise Exception("fruit name is required")

            user = request.user
            fruit = Fruit.objects.create(name=request.data['name'], creator=user)
            return sendresponse(
                response_status="success",
                response_message="Fruit created successfully",
                response_data=FruitSerializer(fruit).data,
                status_code=200)
        except Exception as e:
            return sendresponse(
                response_status='error',
                response_message={**message, "exception": str(e)},
                response_data={},
                status_code=400)

    def get(self, request):
        fruits = Fruit.objects.all()
        serializer = FruitSerializer(fruits, many=True)
        return sendresponse(
            response_status="success",
            response_message="Fruits retrieved successfully",
            response_data=serializer.data,
            status_code=200)
        
