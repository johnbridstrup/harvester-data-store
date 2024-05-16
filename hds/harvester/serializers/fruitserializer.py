# import serializers
from rest_framework import serializers
from ..models import Fruit


class FruitMinimalSerializer(serializers.ModelSerializer):
    class Meta:
        model = Fruit
        fields = (
            "id",
            "url",
            "name",
        )


class FruitSerializer(serializers.ModelSerializer):
    class Meta:
        model = Fruit
        fields = "__all__"
        read_only_fields = ("creator",)
