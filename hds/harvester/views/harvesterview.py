
from rest_framework.decorators import action
from rest_framework.renderers import JSONRenderer

from aftconfigs.serializers import ConfigReportSerializer
from common.utils import make_ok
from common.viewsets import CreateModelViewSet
from hds.roles import RoleChoices
from harvassets.serializers import HarvesterAssetSerializer
from harvdeploy.serializers import HarvesterVersionReportSerializer

from ..filters import HarvesterFilterset
from ..models import Harvester
from ..serializers.harvesterserializer import HarvesterSerializer, HarvesterHistorySerializer


class HarvesterView(CreateModelViewSet):
    queryset = Harvester.objects.all()
    serializer_class = HarvesterSerializer
    filterset_class = HarvesterFilterset
    ordering = ('-id',)
    view_permissions_update = {
        "create": {
            RoleChoices.DEVELOPER: True,
        },
        "destroy": {
            RoleChoices.DEVELOPER: True,
        },
        "update": {
            RoleChoices.SUPPORT: True, # This should become developer once harvester can update location with GPS
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

    @action(
        methods=["get"],
        detail=True,
        url_path="versions",
        renderer_classes=[JSONRenderer]
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
    renderer_classes=[JSONRenderer]
    )
    def get_assets(self, request, pk=None):
        harv = self.get_object()
        assets = [HarvesterAssetSerializer(asset).data for asset in harv.assets.all()]
        return make_ok(f"Harvester {harv.harv_id} assets retrieved", response_data=assets)
    
    @action(
        methods=["get"],
        detail=True,
        url_path="config",
        renderer_classes=[JSONRenderer]
    )
    def latest_config(self, request, pk=None):
        harv = self.get_object()
        conf_report = harv.configreport_set.latest()
        data = ConfigReportSerializer(conf_report).data
        
        return make_ok(f"Harvester {harv.harv_id} config", data)


class HarvesterHistoryView(CreateModelViewSet):
    queryset = Harvester.history.model.objects.all()
    serializer_class = HarvesterHistorySerializer
    filterset_fields = ('harv_id',)
    ordering = ('-history_date',)
