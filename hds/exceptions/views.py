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

from common.viewsets import CreateModelViewSet


class AFTExceptionCodeManifestView(CreateModelViewSet):
    queryset = AFTExceptionCodeManifest.objects.all()
    serializer_class = AFTExceptionCodeManifestSerializer


class AFTExceptionCodeView(CreateModelViewSet):
    queryset = AFTExceptionCode.objects.all()
    serializer_class = AFTExceptionCodeSerializer


class AFTExceptionView(CreateModelViewSet):
    queryset = AFTException.objects.all()
    serializer_class = AFTExceptionSerializer
