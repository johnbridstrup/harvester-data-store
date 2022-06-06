from ..models import ErrorReport
from harvester.models import Harvester, Location
from ..serializers.errorreportserializer import ErrorReportSerializer
from common.viewsets import ReportModelViewSet
from rest_framework.permissions import IsAuthenticated
from rest_framework.filters import SearchFilter, OrderingFilter
from django.utils.timezone import make_aware


class ErrorReportView(ReportModelViewSet):
    queryset = ErrorReport.objects.all()
    serializer_class = ErrorReportSerializer
    permission_classes = (IsAuthenticated,)
    filter_backends = (SearchFilter,)   #  OrderingFilter    
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
        try:
            harv_ids = [int(h) for h in self.request.query_params["harv_ids"].split(',')]
            harvesters = Harvester.objects.filter(harv_id__in=harv_ids).values_list('id', flat=True)
            listfilter['harvester__in'] = harvesters
        except Exception:
            pass

        # get location names from request and filter queryset for location ids
        try:
            location_names = self.request.query_params["locations"].split(',')
            locations = Location.objects.filter(ranch__in=location_names).values_list('id', flat=True)
            listfilter['location__in'] = locations
        except Exception:
            pass

        # get reportTime range from request and filter queryset for reportTime
        try:
            timestamp_range = self.request.query_params["timestamps"].split(',')
            if len(timestamp_range) != 2:
                raise Exception("timestamp range must be a list of two dates")

            start_time = self.extract_timestamp(float(timestamp_range[0]))
            end_time = self.extract_timestamp(float(timestamp_range[1]))
            listfilter['reportTime__range'] = (start_time, end_time)
        except Exception:
            pass

        return ErrorReport.objects.filter(**listfilter).order_by('id')

