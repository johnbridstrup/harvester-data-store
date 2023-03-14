from common.viewsets import CreateModelViewSet
from logparser.filters import LogVideoFilterset
from logparser.models import LogVideo
from logparser.serializers.logvideoserializers import LogVideoSerializer


class LogVideoViewSet(CreateModelViewSet):
    queryset = LogVideo.objects.all()
    serializer_class = LogVideoSerializer
    filterset_class = LogVideoFilterset
    ordering = ("-created",)