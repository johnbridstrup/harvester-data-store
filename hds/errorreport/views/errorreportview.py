from ..models import ErrorReport
from ..serializers.errorreportserializer import ErrorReportSerializer
from common.viewsets import ReportModelViewSet
from rest_framework.permissions import IsAuthenticated


class ErrorReportView(ReportModelViewSet):
    queryset = ErrorReport.objects.all()
    serializer_class = ErrorReportSerializer
    permission_classes = (IsAuthenticated,)
