from rest_framework import serializers

from common.serializers.userserializer import UserCustomSerializer
from harvester.serializers.harvesterserializer import HarvesterMinimalSerializer
from .models import (
    AFTExceptionCode,
    AFTExceptionCodeManifest,
    AFTException
)


class AFTExceptionCodeManifestSerializer(serializers.ModelSerializer):
    class Meta:
        model = AFTExceptionCodeManifest
        fields = ('__all__')
        read_only_fields = ('creator',)


class AFTExceptionCodeSerializer(serializers.ModelSerializer):
    class Meta:
        model = AFTExceptionCode
        fields = ('__all__')
        read_only_fields = ('creator',)


class AFTExceptionSerializer(serializers.ModelSerializer):
    def to_internal_value(self, data):
        code = AFTExceptionCode.objects.get(code=data['code'])
        data._mutable = True
        data['code'] = code.pk
        data._mutable = False
        return super().to_internal_value(data)

    class Meta:
        model = AFTException
        fields = ('__all__')
        read_only_fields = ('creator',)


class ParetoSerializer(serializers.Serializer):
    # Turns queryset into data with value and count
    value = serializers.CharField() # Can be int or str
    count = serializers.IntegerField()

    def __init__(self, instance=None, data=..., new_name=None, **kwargs):
        super().__init__(instance, data, **kwargs)
        self.new_name=new_name

    def to_representation(self, instance):
        data = super().to_representation(instance)

        if self.new_name is not None:
            data[f"{self.new_name}"] = data.pop("value")

        return data


class AFTExceptionListSerializer(AFTExceptionSerializer):
    """
    Return a response with minimal nesting to the list view.

    Exception
        - code is required as object
    """

    code = AFTExceptionCodeSerializer(read_only=True)
    harvester = HarvesterMinimalSerializer(source="report.harvester", read_only=True)

    class Meta(AFTExceptionSerializer.Meta):
        pass


class AFTExceptionDetailSerializer(AFTExceptionSerializer):
    """
    Return a response with full nesting to the detail view
    for any related objected.
    """

    code = AFTExceptionCodeSerializer(read_only=True)
    creator = UserCustomSerializer(read_only=True)
    harvester = HarvesterMinimalSerializer(source="report.harvester", read_only=True)
    modifiedBy = UserCustomSerializer(read_only=True)

    class Meta(AFTExceptionSerializer.Meta):
        pass
