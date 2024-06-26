from common.viewsets import CreateModelViewSet
from harvester.models import HarvesterSwInfo
from harvester.serializers.harvesterswinfoserializer import (
    HarvesterSWInfoSerializer,
    HarvesterSWInfoListSerializer,
)
from harvester.filters import HarvesterSWInfoFilterset


class HarvesterSwInfoView(CreateModelViewSet):
    queryset = HarvesterSwInfo.objects.all()
    serializer_class = HarvesterSWInfoSerializer
    filterset_class = HarvesterSWInfoFilterset
    ordering = ("-id",)

    action_serializers = {
        "create": HarvesterSWInfoSerializer,
        "list": HarvesterSWInfoListSerializer,
    }
