from ..models import ErrorReport
from ..serializers.errorreportserializer import ErrorReportSerializer
from common.viewsets import CreateModelViewSet
from common.reports import DTimeFormatter
from rest_framework.permissions import IsAuthenticated
from rest_framework.filters import SearchFilter, OrderingFilter
from rest_framework.negotiation import DefaultContentNegotiation


class ErrorReportView(CreateModelViewSet):
    queryset = ErrorReport.objects.all()
    content_negotiation_class = DefaultContentNegotiation
    serializer_class = ErrorReportSerializer
    permission_classes = (IsAuthenticated,)
    filter_backends = (SearchFilter, OrderingFilter)
    search_fields = ['harvester']
    ordering_fields = ('harvester', 'location', 'reportTime')

    def get_queryset(self):
        listfilter = {}
        # get query timezone
        tz = self.request.query_params.get('tz', 'US/Pacific')

        # get harv_ids from request and filter queryset for harvester ids
        if 'harv_ids' in self.request.query_params:
            qp = self.request.query_params["harv_ids"]
            if len(qp) > 0:
                harv_ids = [int(h) for h in qp.split(',')]
                listfilter['harvester__harv_id__in'] = harv_ids

        # get location names from request and filter queryset for location ids
        if 'locations' in self.request.query_params:
            qp = self.request.query_params["locations"]
            if len(qp) > 0:
                location_names = self.request.query_params["locations"].split(',')
                listfilter['location__ranch__in'] = location_names

        # get reportTime range from request and filter queryset for reportTime
        # check if start_time exists in query_params
        if 'start_time' in self.request.query_params:
            qp = self.request.query_params["start_time"]
            if len(qp) > 0:
                start_time = DTimeFormatter.format_datetime(qp, tz)
                listfilter['reportTime__gte'] = start_time

        # check if end_time exists in query_params
        if 'end_time' in self.request.query_params:
            qp = self.request.query_params["end_time"]
            if len(qp) > 0:
                end_time = DTimeFormatter.format_datetime(qp, tz)
                listfilter['reportTime__lte'] = end_time

        # get fruit from request and filter queryset for fruit
        if 'fruit' in self.request.query_params:
            qp = self.request.query_params["fruit"]
            if len(qp) > 0:
                listfilter['harvester__fruit__name'] = qp

        # get exception codes from request and filter queryset for exception code
        if 'codes' in self.request.query_params:
            codes = self.request.query_params["codes"].split(",")
            if len(codes) > 0:
                listfilter['exceptions__code__code__in'] = codes

        # get traceback from request and filter queryset for traceback
        if 'traceback' in self.request.query_params:
            traceback = self.request.query_params["traceback"]
            if len(traceback) > 0:
                listfilter['exceptions__traceback__icontains'] = traceback

        return ErrorReport.objects.filter(**listfilter).order_by('-reportTime').distinct()

