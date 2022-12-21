from common.utils import make_ok
from common.viewsets import CreateModelViewSet
from hds.roles import RoleChoices
from rest_framework import status
from rest_framework.decorators import action
from rest_framework.renderers import JSONRenderer

from .models import MigrationLog
from .serializers import MigrationLogSerializer
from .tasks import execute_migrations

import os


class MigrationLogView(CreateModelViewSet):
    queryset = MigrationLog.objects.all()
    serializer_class = MigrationLogSerializer
    filterset_fields = ('result',)
    ordering = ('-id',)
    http_method_names = ['get']
    view_permissions_update = {
        'queue_migrations': {
            RoleChoices.MANAGER: True,
        },
        'retrieve': {
            RoleChoices.DEVELOPER: True,
        },
        'create': None,
        'destroy': None,
        'update': None,
    }

    @action(
        methods=['get'],
        detail=False,
        url_path='migrate',
        renderer_classes=[JSONRenderer,],
    )
    def queue_migrations(self, request): 
        log = MigrationLog(
            creator=self.request.user,
            result=MigrationLog.ResultChoices.PENDING,
            githash=os.environ.get("GITHASH", "UNKNOWN"),
        )
        log.save()

        execute_migrations.delay(log.id)
        return make_ok(
            "Migration queued.", 
            response_status=status.HTTP_202_ACCEPTED,
            response_data={"id": log.id}
        )

