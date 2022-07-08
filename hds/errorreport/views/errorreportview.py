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
                t_str = ErrorReportView.fill_dt_with_zeros(qp)
                start_time = make_aware(timezone.datetime.strptime(t_str, '%Y%m%d%H%M%S'))
                listfilter['reportTime__gte'] = start_time

        # check if end_time exists in query_params
        if 'end_time' in self.request.query_params:
            qp = self.request.query_params["end_time"]
            if len(qp) > 0:
                t_str = ErrorReportView.fill_dt_with_zeros(qp)
                end_time = make_aware(timezone.datetime.strptime(t_str, '%Y%m%d%H%M%S'))
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

    def _serv_in_err(self, errdict):
        data = {}
        try:
            data["service"] = list(errdict.keys())[0]
        except IndexError:
            data["service"] = "unknown"
        data["error"] = errdict.get(data["service"], {})
        data["error"].pop("ts", None)
        return data

    def _extract_error_traceback(self, report):
        rep = report['data']
        data = {}
        data["branch"] = report['data'].pop("branch_name", None)
        data["githash"] = report['data'].pop("githash", None)
        data["report"] = rep['sysmon_report']

        data["report"].pop("serial_number", None)

        rep.pop("serial_number")
        for key, sysdict in rep['sysmon_report'].items():
            if 'sysmon' in key:
                if "errors" in sysdict:
                    err = report['data']['sysmon_report'][key].pop("errors", {})
                    data.update(self._serv_in_err(err))
                    data["code"] = data["error"].pop("code", 0)
                    return data
        return data

    def tablify_error_report(self, obj, json=False):
        if json:
            data = self._extract_error_traceback(obj['report'])
            data.update({
                "harvester": Harvester.objects.get(pk=obj['harvester']),
                "location": Location.objects.get(pk=obj["location"]),
                "time": obj['reportTime'],
                "report_number": obj['id']
            })
        else:
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
    
    def list(self, request, *args, **kwargs):
        q = super().list(request, *args, **kwargs)
        if request.accepted_renderer.format == 'html':
            results = []
            for rep in q.data['results']:
                res = self.tablify_error_report(rep, json=True)
                res.pop("report", None)
                results.append(res)
            q.data['results'] = results
            return Response({"data": q.data})
        
        return super().list(request, *args, **kwargs)
