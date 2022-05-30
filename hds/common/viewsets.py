from rest_framework.viewsets import ModelViewSet
from harvester.models import Harvester
from .renderers import HDSJSONRenderer
import datetime


class CreateModelViewSet(ModelViewSet):
    renderer_classes = (HDSJSONRenderer,)
    
    def perform_create(self, serializer):
        serializer.save(creator=self.request.user)


class ReportModelViewSet(CreateModelViewSet):
    """prepare data from request to add or update in the errorreport model"""

    def extract_timestamp(self, timestamp):
        """get POSIX timestamp and return in date format"""
        try:
            return datetime.datetime.fromtimestamp(timestamp).strftime('%Y-%m-%d %H:%M:%S')
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
            return response
        except Exception as e:
            raise Exception(str(e))

    def update(self, request, *args, **kwargs):
        try:
            request = self.prepare_data(request)
            response = super().update(request, *args, **kwargs)
            return response
        except Exception as e:
            raise Exception(str(e))        
