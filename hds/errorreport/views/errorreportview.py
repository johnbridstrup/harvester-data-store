import logging
from ..models import ErrorReport
from ..serializers.errorreportserializer import ErrorReportSerializer
from common.viewsets import CreateModelViewSet
from common.renderers import HDSJSONRenderer
from common.reports import ErrorReportExtractor, DTimeFormatter
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.filters import SearchFilter, OrderingFilter
from rest_framework.renderers import TemplateHTMLRenderer
from rest_framework.negotiation import DefaultContentNegotiation
from rest_framework.response import Response
from harvester.models import Harvester, Location

from django.utils.timezone import make_aware
from django.utils import timezone
from rest_framework.renderers import TemplateHTMLRenderer


class ErrorReportView(CreateModelViewSet):
    queryset = ErrorReport.objects.all()
    content_negotiation_class = DefaultContentNegotiation
    serializer_class = ErrorReportSerializer
    permission_classes = (IsAuthenticated,)
    renderer_classes = (TemplateHTMLRenderer, HDSJSONRenderer)
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

        return ErrorReport.objects.filter(**listfilter).order_by('-reportTime')

    @classmethod
    def fill_dt_with_zeros(cls, time_str):
        """Fill with zeros if not all YYYYMMDDHHmmss are present"""
        if len(time_str) < 14:
            time_str += '0' * (14 - len(time_str))
        return time_str

    def get_template_names(self):
        if self.action == 'list':            
            return ['errorreport/list.html']
        elif self.action == 'retrieve':            
            return ['errorreport/detail.html']

    def retrieve(self, request, *args, **kwargs):
        if request.accepted_renderer.format == 'html':
            q = super().retrieve(request, *args, **kwargs)
            extractor = ErrorReportExtractor(q.data,'retrieve')
            return Response(extractor.tablify())
        return super().retrieve(request, *args, **kwargs)
    
    def list(self, request, *args, **kwargs):
        q = super().list(request, *args, **kwargs)
        if request.accepted_renderer.format == 'html':
            extractor = ErrorReportExtractor(q.data,'list')
            return Response({"data": extractor.tablify()})
        
        return q
