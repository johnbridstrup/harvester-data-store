from ..models import HarvesterCodeRelease
from ..serializers import HarvesterCodeReleaseSerializer

from rest_framework.permissions import IsAuthenticated
from common.viewsets import CreateModelViewSet


class HarvesterCodeReleaseView(CreateModelViewSet):
    queryset = HarvesterCodeRelease.objects.all()
    serializer_class = HarvesterCodeReleaseSerializer

    def get_queryset(self):
        listfilter = {}
        fruit = self.request.query_params.get("fruit", None)

        if fruit:
            listfilter["fruit__name"] = fruit
        
        return HarvesterCodeRelease.objects.filter(**listfilter).order_by('-created').distinct()