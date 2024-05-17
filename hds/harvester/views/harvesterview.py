from rest_framework.decorators import action
from rest_framework.renderers import JSONRenderer

from aftconfigs.serializers import ConfigReportSerializer
from common.utils import make_ok
from common.viewsets import CreateModelViewSet
from common.schema import HDSToRepAutoSchema
from hds.roles import RoleChoices
from harvassets.serializers import HarvesterAssetSerializer
from harvdeploy.serializers import HarvesterVersionReportSerializer

from ..filters import HarvesterFilterset
from ..models import Harvester
from ..serializers.harvesterserializer import (
    HarvesterSerializer,
    HarvesterHistorySerializer,
    HarvesterListSerializer,
    HarvesterDetailSerializer,
)


class HarvesterView(CreateModelViewSet):
    queryset = Harvester.objects.all()
    serializer_class = HarvesterSerializer
    filterset_class = HarvesterFilterset
    ordering = ("-id",)
    schema = HDSToRepAutoSchema(
        extra_info={
            "harvester_history": {"type": "string", "nullable": "true"},
            "version_history": {"type": "string", "nullable": "true"},
            "assets": {"type": "string", "nullable": "true"},
            "config": {"type": "string", "nullable": "true"},
        }
    )
    view_permissions_update = {
        "create": {
            RoleChoices.DEVELOPER: True,
        },
        "destroy": {
            RoleChoices.DEVELOPER: True,
        },
        "update": {
            RoleChoices.SUPPORT: True,  # This should become developer once harvester can update location with GPS
        },
        "partial_update": {
            RoleChoices.SUPPORT: True,
        },
        "version_history": {
            RoleChoices.SUPPORT: True,
        },
        "get_assets": {
            RoleChoices.SUPPORT: True,
        },
        "latest_config": {
            RoleChoices.SUPPORT: True,
        },
    }
    action_serializers = {
        "list": HarvesterListSerializer,
        "retrieve": HarvesterDetailSerializer,
    }

    def get_queryset(self):
        return Harvester.objects.select_related(
            "creator",
            "modifiedBy",
            "fruit",
            "location",
            "release",
        )

    @action(
        methods=["get"],
        detail=True,
        url_path="versions",
        renderer_classes=[JSONRenderer],
    )
    def version_history(self, request, pk=None):
        harv = self.get_object()
        queryset = harv.version_history.all()
        page = self.paginate_queryset(queryset=queryset)
        if page is not None:
            serializer = HarvesterVersionReportSerializer(page, many=True)
            resp = self.get_paginated_response(serializer.data)
            data = resp.data
        else:
            serializer = HarvesterVersionReportSerializer(queryset, many=True)
            data = serializer.data
        return make_ok(f"Harvester {harv.harv_id} version history", data)

    @action(
        methods=["get"],
        detail=True,
        url_path="assets",
        renderer_classes=[JSONRenderer],
    )
    def get_assets(self, request, pk=None):
        harv = self.get_object()
        assets = [
            HarvesterAssetSerializer(asset).data for asset in harv.assets.all()
        ]
        return make_ok(
            f"Harvester {harv.harv_id} assets retrieved", response_data=assets
        )

    @action(
        methods=["get"],
        detail=True,
        url_path="config",
        renderer_classes=[JSONRenderer],
    )
    def latest_config(self, request, pk=None):
        harv = self.get_object()
        conf_report = harv.configreport_set.latest()
        data = ConfigReportSerializer(conf_report).data

        return make_ok(f"Harvester {harv.harv_id} config", data)


class HarvesterHistoryView(CreateModelViewSet):
    queryset = Harvester.history.model.objects.select_related(
        "creator", "modifiedBy", "fruit", "location", "release"
    )
    serializer_class = HarvesterHistorySerializer
    filterset_fields = ("harv_id",)
    ordering = ("-history_date",)
