from rest_framework import serializers
from harvester.serializers.fruitserializer import FruitSerializer
from .models import HarvesterCodeRelease
from harvester.models import Fruit


class HarvesterCodeReleaseSerializer(serializers.ModelSerializer):
    class Meta:
        model = HarvesterCodeRelease
        fields = ('__all__')
        read_only_fields = ('creator',)

    def to_internal_value(self, data):
        release = data.copy()
        version = data.get('version')
        fruit_str = data.get('project').lower()
        fruit = Fruit.objects.get(name=fruit_str)

        data = {
            'version': version,
            'release': release,
            'fruit': fruit.id
        }
        return super().to_internal_value(data)

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data["fruit"] = FruitSerializer(instance=instance.fruit).data
        return data