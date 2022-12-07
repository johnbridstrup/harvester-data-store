from .models import (
    AFTExceptionCode,
    AFTExceptionCodeManifest, 
    AFTException
)
from .serializers import (
    AFTExceptionCodeSerializer,
    AFTExceptionCodeManifestSerializer, 
    AFTExceptionSerializer,
)
from .tasks import update_exception_codes

from common.viewsets import CreateModelViewSet
from hds.roles import RoleChoices


class AFTExceptionCodeManifestView(CreateModelViewSet):
    queryset = AFTExceptionCodeManifest.objects.all()
    serializer_class = AFTExceptionCodeManifestSerializer
    view_permissions_update = {
        'create': {
            RoleChoices.JENKINS: True,
        }
    }

    def perform_create(self, serializer):
        super().perform_create(serializer)
        update_exception_codes.delay(serializer.data["id"], self.request.user.id)


class AFTExceptionCodeView(CreateModelViewSet):
    queryset = AFTExceptionCode.objects.all()
    serializer_class = AFTExceptionCodeSerializer


class AFTExceptionView(CreateModelViewSet):
    queryset = AFTException.objects.all()
    serializer_class = AFTExceptionSerializer
