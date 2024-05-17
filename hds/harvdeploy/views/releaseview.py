from django.utils.decorators import method_decorator
from django.views.decorators.cache import cache_page
from rest_framework.decorators import action
from rest_framework.renderers import JSONRenderer

from harvester.serializers.harvesterserializer import HarvesterSerializer
from common.viewsets import CreateModelViewSet
from common.utils import make_ok
from hds.roles import RoleChoices

from ..filters import ReleaseFilter
from ..models import HarvesterCodeRelease
from ..serializers import (
    HarvesterCodeReleaseSerializer,
    HarvesterCodeReleaseDetailSerializer,
)


class HarvesterCodeReleaseView(CreateModelViewSet):
    queryset = HarvesterCodeRelease.objects.all()
    serializer_class = HarvesterCodeReleaseSerializer
    filterset_class = ReleaseFilter
    ordering = ("-created",)
    view_permissions_update = {
        "create": {
            RoleChoices.JENKINS: True,
        },
        "destroy": {
            RoleChoices.MANAGER: True,
        },
        "update": {
            RoleChoices.DEVELOPER: True,
        },  # This should handle only updating tags
        "update_tags": {
            RoleChoices.DEVELOPER: True,
        },
        "harvester_view": {
            RoleChoices.SUPPORT: True,
        },
        "tags_view": {
            RoleChoices.SUPPORT: True,
        },
    }
    action_serializers = {"retrieve": HarvesterCodeReleaseDetailSerializer}

    @action(
        methods=["post", "patch"],
        detail=True,
        url_path="update_tags",
        renderer_classes=[JSONRenderer],
    )
    def update_tags(self, request, pk=None):
        obj = self.get_object()
        data = request.data
        tags = data.get("tags", [])
        obj.tags = tags
        obj.save()
        serializer = self.get_serializer(obj)
        return make_ok("Tags updated", response_data=serializer.data)

    @action(
        methods=["GET"],
        detail=True,
        url_path="harvesters",
        renderer_classes=[JSONRenderer],
    )
    @method_decorator(cache_page(60 * 10))
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
        methods=["GET"],
        detail=False,
        url_path="tags",
        renderer_classes=[JSONRenderer],
    )
    def tags_view(self, request, pk=None):
        queryset = HarvesterCodeRelease.tags.all().values_list(
            "name", flat=True
        )
        return make_ok(
            f"Release tags retrieved successfully", {"tags": list(queryset)}
        )
