from ..models import HarvesterCodeRelease
from ..serializers import HarvesterCodeReleaseSerializer

from rest_framework.permissions import IsAuthenticated
from common.viewsets import CreateModelViewSet


class HarvesterCodeReleaseView(CreateModelViewSet):
    queryset = HarvesterCodeRelease.objects.all()
    serializer_class = HarvesterCodeReleaseSerializer
    permission_classes = (IsAuthenticated,)
