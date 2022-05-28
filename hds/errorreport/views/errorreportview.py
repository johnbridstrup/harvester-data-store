from ..models import ErrorReport
from ..serializers.errorreportserializer import ErrorReportSerializer
from common.viewsets import ReportModelViewSet
from rest_framework.permissions import IsAuthenticated
from common.utils import make_ok


class ErrorReportView(ReportModelViewSet):
    queryset = ErrorReport.objects.all()
    serializer_class = ErrorReportSerializer
    permission_classes = (IsAuthenticated,)

    def create(self, request, *args, **kwargs):
        try:
            request = self.prepare_data(request)
            response = super().create(request, *args, **kwargs)
            return make_ok("Error Report created successfully", response.data, 201)
        except Exception as e:
            raise Exception(str(e))

    # update errorreport
    def update(self, request, *args, **kwargs):
        request = self.prepare_data(request)
        response = super().update(request, *args, **kwargs)
        return make_ok("Error report updated successfully", response.data)
