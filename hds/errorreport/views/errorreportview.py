from ..models import ErrorReport
from harvester.models import Harvester
from ..serializers.errorreportserializer import ErrorReportSerializer
from common.viewsets import ReportModelViewSet
from rest_framework.permissions import IsAuthenticated
from rest_framework.filters import SearchFilter, OrderingFilter
from django.utils.timezone import make_aware
from django.utils import timezone


class ErrorReportView(ReportModelViewSet):
    queryset = ErrorReport.objects.all()
    serializer_class = ErrorReportSerializer
    permission_classes = (IsAuthenticated,)
    filter_backends = (SearchFilter, OrderingFilter)
    search_fields = ['harvester']
    ordering_fields = ('harvester', 'location', 'reportTime')

    def prepare_data(self, request):
        """ prepare data from request to add or update in the model
            request data contains only the report data
            it will be updated to add harvester, location and report fields with corresponding values
        """

        report = request.data.copy()
        harv_id = int(report['data']['sysmon_report']['serial_number'])
        harvester = Harvester.objects.get(harv_id=harv_id)

        # update report data
        request.data['harvester'] = harvester.id
        request.data['location'] = harvester.location.id
        request.data['reportTime'] = self.extract_timestamp(report['timestamp'])
        request.data['report'] = report

        return request

    def get_queryset(self):
        listfilter = {}
        # get harv_ids from request and filter queryset for harvester ids
        if 'harv_ids' in self.request.query_params:
            harv_ids = [int(h) for h in self.request.query_params["harv_ids"].split(',')]
            listfilter['harvester__harv_id__in'] = harv_ids

        # get location names from request and filter queryset for location ids
        if 'locations' in self.request.query_params:
            location_names = self.request.query_params["locations"].split(',')
            listfilter['location__ranch__in'] = location_names

        # get reportTime range from request and filter queryset for reportTime
        # check if start_time exists in query_params
        if 'start_time' in self.request.query_params:
            start_time = self.extract_timestamp(float(self.request.query_params["start_time"]))
            start_time = make_aware(timezone.datetime.strptime(start_time, '%Y-%m-%d %H:%M:%S.%f'))
            listfilter['reportTime__gte'] = start_time

        # check if end_time exists in query_params
        if 'end_time' in self.request.query_params:
            end_time = self.extract_timestamp(float(self.request.query_params["end_time"]))
            end_time = make_aware(timezone.datetime.strptime(end_time, '%Y-%m-%d %H:%M:%S.%f'))
            listfilter['reportTime__lte'] = end_time

        return ErrorReport.objects.filter(**listfilter).order_by('-reportTime')
