from ..models import Harvester
from ..serializers.harvesterserializer import HarvesterSerializer, HarvesterHistorySerializer

from harvdeploy.serializers import HarvesterVersionReportSerializer

from rest_framework.decorators import action
from rest_framework.renderers import JSONRenderer
from common.utils import make_ok
from common.viewsets import CreateModelViewSet


class HarvesterView(CreateModelViewSet):
    queryset = Harvester.objects.all()
    serializer_class = HarvesterSerializer

    def get_queryset(self):
        filter_dict = {}
        if "harv_id" in self.request.query_params:
            filter_dict["harv_id"] = int(self.request.query_params.get("harv_id"))
        return self.queryset.filter(**filter_dict).order_by('-id').distinct()

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



class HarvesterHistoryView(CreateModelViewSet):
    queryset = Harvester.history.model.objects.all()
    serializer_class = HarvesterHistorySerializer

    def get_queryset(self):
        filter = {}
        if "harv_id" in self.request.query_params:
            filter["harv_id"] = int(self.request.query_params.get("harv_id"))
        harvs = Harvester.history.model.objects.filter(**filter).order_by('-history_date').distinct()
        return harvs
