from common.viewsets import CreateModelViewSet
from logparser.models import LogVideo
from logparser.serializers.logvideoserializers import LogVideoSerializer


class LogVideoViewSet(CreateModelViewSet):
    queryset = LogVideo.objects.all()
    serializer_class = LogVideoSerializer
    filterset_fields = (
        'log_session_id',
        'category',
        'robot',
        'log_session__harv__harv_id'
    )
    ordering = ("-created",)