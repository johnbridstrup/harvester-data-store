from ..models import HarvesterVersionReport
from ..serializers import HarvesterVersionReportSerializer

from rest_framework.permissions import IsAuthenticated
from common.viewsets import CreateModelViewSet


class HarvesterVersionReportView(CreateModelViewSet):
    queryset = HarvesterVersionReport.objects.all()
    serializer_class = HarvesterVersionReportSerializer
    permission_classes = (IsAuthenticated,)