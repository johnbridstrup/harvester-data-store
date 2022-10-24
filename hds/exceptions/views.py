from .models import AFTExceptionCode, AFTException
from .serializers import AFTExceptionCodeSerializer, AFTExceptionSerializer

from common.viewsets import CreateModelViewSet


class AFTExceptionCodeView(CreateModelViewSet):
    queryset = AFTExceptionCode.objects.all()
    serializer_class = AFTExceptionCodeSerializer


class AFTExceptionView(CreateModelViewSet):
    queryset = AFTException.objects.all()
    serializer_class = AFTExceptionSerializer
