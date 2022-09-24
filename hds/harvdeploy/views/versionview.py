from ..models import HarvesterVersionReport
from ..serializers import HarvesterVersionReportSerializer

from rest_framework.permissions import IsAuthenticated
from common.viewsets import CreateModelViewSet


class HarvesterVersionReportView(CreateModelViewSet):
    queryset = HarvesterVersionReport.objects.all()
    serializer_class = HarvesterVersionReportSerializer
    permission_classes = (IsAuthenticated,)

    def get_queryset(self):
        listfilter = {}
        harv_id = self.request.query_params.get("harv_id", None)
        
        if harv_id is not None:
            listfilter['harvester__harv_id'] = harv_id
        
        return HarvesterVersionReport.objects.filter(**listfilter).order_by('-reportTime').distinct()
