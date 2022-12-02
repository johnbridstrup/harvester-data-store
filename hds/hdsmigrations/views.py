from common.viewsets import CreateModelViewSet

from .models import MigrationLog
from .serializers import MigrationLogSerializer


class MigrationLogView(CreateModelViewSet):
    queryset = MigrationLog.objects.all()
    serializer_class = MigrationLogSerializer
    filterset_fields = ('result',)
    ordering = ('-id',)
    http_method_names = ['get']
