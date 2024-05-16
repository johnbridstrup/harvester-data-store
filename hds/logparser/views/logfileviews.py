from common.viewsets import CreateModelViewSet
from logparser.filters import LogFileFilterset
from logparser.models import LogFile
from logparser.serializers.logfileserializers import LogFileSerializer


class LogFileViewSet(CreateModelViewSet):
    queryset = LogFile.objects.all()
    serializer_class = LogFileSerializer
    filterset_class = LogFileFilterset
    ordering = ("-created",)
