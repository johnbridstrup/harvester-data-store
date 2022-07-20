from .models import AFTExceptionCode
from .serializers import AFTExceptionCodeSerializer

from rest_framework.permissions import IsAuthenticated
from common.viewsets import CreateModelViewSet


class AFTExceptionCodeView(CreateModelViewSet):
    queryset = AFTExceptionCode.objects.all()
    serializer_class = AFTExceptionCodeSerializer
    permission_classes = (IsAuthenticated,)
