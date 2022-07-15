from .models import AFTExceptionCode, AFTException
from .serializers import AFTExceptionCodeSerializer, AFTExceptionSerializer

from rest_framework.permissions import IsAuthenticated
from common.viewsets import CreateModelViewSet


class AFTExceptionCodeView(CreateModelViewSet):
    queryset = AFTExceptionCode.objects.all()
    serializer_class = AFTExceptionCodeSerializer
    permission_classes = (IsAuthenticated,)


class AFTExceptionView(CreateModelViewSet):
    queryset = AFTException.objects.all()
    serializer_class = AFTExceptionSerializer
    permission_classes = (IsAuthenticated,)
