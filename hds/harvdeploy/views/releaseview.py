from rest_framework.decorators import action
from rest_framework.renderers import JSONRenderer
from ..filters import ReleaseFilter
from ..models import HarvesterCodeRelease
from ..serializers import HarvesterCodeReleaseSerializer
from harvester.serializers.harvesterserializer import (
    HarvesterSerializer
)

from common.viewsets import CreateModelViewSet
from common.utils import make_ok


class HarvesterCodeReleaseView(CreateModelViewSet):
    queryset = HarvesterCodeRelease.objects.all()
    serializer_class = HarvesterCodeReleaseSerializer
    filterset_class = ReleaseFilter
    ordering = ("-created",)

    @action(
        methods=['GET'],
        detail=True,
        url_path='harvesters',
        renderer_classes=[JSONRenderer]
    )
    def harvester_view(self, request, pk=None):
        obj = self.get_object()
        queryset = obj.harvester_set.all()

        page = self.paginate_queryset(queryset=queryset)
        if page is not None:
            serializer = HarvesterSerializer(page, many=True)
            resp = self.get_paginated_response(serializer.data)
            data = resp.data
        else:
            serializer = HarvesterSerializer(queryset, many=True)
            data = serializer.data
        return make_ok(f"Harvesters release retrieved successfully", data)

    @action(
        methods=['GET'],
        detail=False,
        url_path='tags',
        renderer_classes=[JSONRenderer]
    )
    def tags_view(self, request, pk=None):
        queryset = HarvesterCodeRelease.tags.all().values_list("name")
        tags = [tag[0] for tag in queryset]
        return make_ok(f"Release tags retrieved successfully", {'tags': tags})
