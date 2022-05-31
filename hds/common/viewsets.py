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
        """ prepare data from request to add or update in the model
            request data contains only the report data
            it will be updated to add harvester, location and report fields with corresponding values
        """
        raise NotImplementedError("Must implement prepare_data()")

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
