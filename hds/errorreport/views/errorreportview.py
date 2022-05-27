from ..models import ErrorReport
from harvester.models import Harvester
from ..serializers.errorreportserializer import ErrorReportSerializer
from rest_framework.viewsets import ModelViewSet
from rest_framework.permissions import IsAuthenticated
from common.utils import make_ok
from datetime import datetime


class ErrorReportView(ModelViewSet):
    queryset = ErrorReport.objects.all()
    serializer_class = ErrorReportSerializer
    permission_classes = (IsAuthenticated,)

    def perform_create(self, serializer):
        serializer.save(creator=self.request.user)

    def extract_timestamp(self, timestamp):
        """get POSIX timestamp and return in date format"""
        try:
            return datetime.fromtimestamp(timestamp).strftime('%Y-%m-%d %H:%M:%S')
        except:
            return None

    def prepare_data(self, request):
        """ prepare data from request to add or update in the model"""
        try:
            report = request.data['report']        
            # get reportTime from report json
            request.data['reportTime'] = self.extract_timestamp(report['timestamp'])

            # get harv_id from report json
            harv_id = int(report['data']['sysmon_report']['serial_number'])
            harvester = Harvester.objects.get(harv_id=harv_id)

            # get harvester and location based on harv_id
            request.data['harvester'] = harvester.id
            request.data['location'] = harvester.location.id
            return request
        except Exception as e:
            raise Exception(f"Error in preparing data. {str(e)}")

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

    # get all errorreports
    def list(self, request, *args, **kwargs):
        response = super().list(request, *args, **kwargs)
        return make_ok("Error reports retrieved successfully", response.data)

    # get errorreport by id
    def retrieve(self, request, *args, **kwargs):
        response = super().retrieve(request, *args, **kwargs)
        return make_ok("Error report retrieved successfully", response.data)

    # delete errorreport
    def destroy(self, request, *args, **kwargs):
        response = super().destroy(request, *args, **kwargs)
        return make_ok("Error report deleted successfully", response.data)