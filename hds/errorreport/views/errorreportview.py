import logging
from ..models import ErrorReport
from ..serializers.errorreportserializer import ErrorReportSerializer
from common.viewsets import CreateModelViewSet
from common.renderers import HDSJSONRenderer
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.filters import SearchFilter, OrderingFilter
from rest_framework.renderers import TemplateHTMLRenderer
from rest_framework.negotiation import DefaultContentNegotiation
from rest_framework.response import Response

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
            start_time = self.get_serializer().extract_timestamp(float(self.request.query_params["start_time"]))
            start_time = make_aware(timezone.datetime.strptime(start_time, '%Y-%m-%d %H:%M:%S.%f'))
            listfilter['reportTime__gte'] = start_time

        # check if end_time exists in query_params
        if 'end_time' in self.request.query_params:
            end_time = self.get_serializer().extract_timestamp(float(self.request.query_params["end_time"]))
            end_time = make_aware(timezone.datetime.strptime(end_time, '%Y-%m-%d %H:%M:%S.%f'))
            listfilter['reportTime__lte'] = end_time

        return ErrorReport.objects.filter(**listfilter).order_by('-reportTime')

    def get_template_names(self):
        if self.action == 'list':            
            return ['errorreport/list.html']
        elif self.action == 'retrieve':            
            return ['errorreport/detail.html']

    def _serv_in_err(self, errdict):
        data = {}
        data["service"] = list(errdict.keys())[0]
        data["error"] = errdict[data["service"]]
        data["error"].pop("ts")
        return data

    def _extract_error_traceback(self, report):
        rep = report['data']
        data = {}
        data["branch"] = report['data'].pop("branch_name", None)
        data["githash"] = report['data'].pop("githash", None)
        rep.pop("serial_number")
        for key, sysdict in rep['sysmon_report'].items():
            if 'sysmon' in key:
                if "errors" in sysdict:
                    err = report['data']['sysmon_report'][key].pop("errors")
                    data.update(self._serv_in_err(err))
                    data["code"] = data["error"].pop("code")
                    data["report"] = rep['sysmon_report']
                    data["report"].pop("serial_number")
                    return data

    def tablify_error_report(self, obj):
        data = self._extract_error_traceback(obj.report)
        data.update({
            "harvester": obj.harvester,
            "location": obj.location,
            "time": obj.reportTime,
            "report_number": obj.pk
        })
        return data

    def retrieve(self, request, *args, **kwargs):
        if request.accepted_renderer.format == 'html':
            obj = self.get_object()
            data = self.tablify_error_report(obj)
            return Response(data)
        return super().retrieve(request, *args, **kwargs)
