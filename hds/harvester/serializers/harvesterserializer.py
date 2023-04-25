# import serializers
from rest_framework import serializers

from harvdeploy.models import HarvesterVersionReport
from harvdeploy.serializers import HarvesterCodeReleaseSerializer, HarvesterVersionReportSerializer
from location.serializers.locationserializer import LocationSerializer
from .fruitserializer import FruitSerializer
from ..models import Harvester


class HarvesterSerializer(serializers.ModelSerializer):
    class Meta:
        model = Harvester
        fields = ('__all__')
        read_only_fields = ('creator',)

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data['fruit'] = FruitSerializer(instance.fruit).data
        data['location'] = LocationSerializer(instance.location).data
        data['harvester_history'] = f"/harvesterhistory/?harv_id={instance.harv_id}"
        data['version_history'] = 'versions/'
        data["assets"] = "assets/"
        data['config'] = 'config/'
        if instance.release:
            data['release'] = HarvesterCodeReleaseSerializer(instance.release).data
        else:
            data['release'] = None
        try:
            vers = instance.current_version()
            data['version'] = HarvesterVersionReportSerializer(vers).data
        except HarvesterVersionReport.DoesNotExist:
            data['version'] = None
        return data


class HarvesterHistorySerializer(serializers.ModelSerializer):
    fruit = FruitSerializer()
    location = LocationSerializer()
    release = HarvesterCodeReleaseSerializer()
    class Meta:
        model = Harvester.history.model
        fields = ('__all__')
        read_only_fields = ('__all__',)
