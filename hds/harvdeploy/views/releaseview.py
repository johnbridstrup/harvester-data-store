from ..filters import ReleaseFilter
from ..models import HarvesterCodeRelease
from ..serializers import HarvesterCodeReleaseSerializer

from common.viewsets import CreateModelViewSet


class HarvesterCodeReleaseView(CreateModelViewSet):
    queryset = HarvesterCodeRelease.objects.all()
    serializer_class = HarvesterCodeReleaseSerializer
    filterset_class = ReleaseFilter
    ordering = ("-created",)
