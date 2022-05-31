from ..models import ErrorReport
from harvester.models import Harvester
from ..serializers.errorreportserializer import ErrorReportSerializer
from common.viewsets import ReportModelViewSet
from rest_framework.permissions import IsAuthenticated


class ErrorReportView(ReportModelViewSet):
    queryset = ErrorReport.objects.all()
    serializer_class = ErrorReportSerializer
    permission_classes = (IsAuthenticated,)

    def prepare_data(self, request):
        """ prepare data from request to add or update in the model
            request data contains only the report data
            it will be updated to add harvester, location and report fields with corresponding values
        """
        try:
            report = request.data.copy()
            harv_id = int(report['data']['sysmon_report']['serial_number'])
            harvester = Harvester.objects.get(harv_id=harv_id)

            # update report data
            request.data['harvester'] = harvester.id
            request.data['location'] = harvester.location.id
            request.data['reportTime'] = self.extract_timestamp(report['timestamp'])
            request.data['report'] = report

            # remove original data
            request.data.pop('data')
            request.data.pop('timestamp')
            request.data.pop('type')

            return request
        except Exception as e:
            raise Exception(f"Error in preparing data. {str(e)}")

