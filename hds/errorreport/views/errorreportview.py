import logging
import os
from rest_framework.renderers import JSONRenderer
from ..models import ErrorReport
from ..metrics import (
    ERRORREPORT_LIST_QUERY_TIMER,
    PARETO_QUERY_TIMER
)
from ..serializers.errorreportserializer import (
    ErrorReportSerializer,
    ParetoSerializer
)
from exceptions.models import AFTException
from common.viewsets import CreateModelViewSet
from common.reports import DTimeFormatter
from common.utils import make_ok, build_frontend_url
from notifications.signals import error_report_created
from notifications.serializers import NotificationSerializer
from django.db.models import Count, F
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
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

    def perform_create(self, serializer):
        super().perform_create(serializer)
        report_id = serializer.data['id']
        url = build_frontend_url(endpoint="errorreports", _id=report_id)
        error_report_created.send(sender=ErrorReport, instance_id=report_id, url=url) 

    @classmethod
    def build_list_filter(cls, request):
        """Builds the filter dictionary for the query.

        Django's filter function takes a set of kwargs using the django field
        lookup syntax. E.g. fieldname__lookup_value.

        Args:
            request (HttpRequest): The request that is initializing the query

        Returns:
            dict: dictionary of query params and values
        """
        listfilter = {}
        # get query timezone
        tz = request.query_params.get('tz', 'US/Pacific')

        # get harv_ids fromrequest and filter queryset for harvester ids
        if 'harv_ids' in request.query_params:
            qp = request.query_params["harv_ids"]
            if len(qp) > 0:
                harv_ids = [int(h) for h in qp.split(',')]
                listfilter['harvester__harv_id__in'] = harv_ids

        # get location names from request and filter queryset for location ids
        if 'locations' in request.query_params:
            qp = request.query_params["locations"]
            if len(qp) > 0:
                location_names = request.query_params["locations"].split(',')
                listfilter['location__ranch__in'] = location_names

        # get reportTime range fromrequest and filter queryset for reportTime
        # check if start_time exists in query_params
        if 'start_time' in request.query_params:
            qp = request.query_params["start_time"]
            if len(qp) > 0:
                start_time = DTimeFormatter.format_datetime(qp, tz)
                listfilter['reportTime__gte'] = start_time

        # check if end_time exists in query_params
        if 'end_time' in request.query_params:
            qp = request.query_params["end_time"]
            if len(qp) > 0:
                end_time = DTimeFormatter.format_datetime(qp, tz)
                listfilter['reportTime__lte'] = end_time

        # get fruit fromrequest and filter queryset for fruit
        if 'fruits' in request.query_params:
            fruits = request.query_params["fruits"].split(",")
            if len(fruits) > 0:
                listfilter['harvester__fruit__name__in'] = fruits

        # get exception codes fromrequest and filter queryset for exception code
        if 'codes' in request.query_params:
            codes = request.query_params["codes"].split(",")
            if len(codes) > 0:
                listfilter['exceptions__code__code__in'] = codes

        # get traceback fromrequest and filter queryset for traceback
        if 'traceback' in request.query_params:
            traceback = request.query_params["traceback"]
            if len(traceback) > 0:
                listfilter['exceptions__traceback__icontains'] = traceback

        return listfilter

    @classmethod
    def swap_foreign_key_relation_lookup(cls, listfilter, replace='exceptions__', _append='report__'):
        """Swap field lookup keys across foreign key relationship

        Args:
            listfilter (dict): field lookup keys and values
            replace (str, optional): Field lookup key to drop. Defaults to 'exceptions__'.
            _append (str, optional): Field lookup key to add when replace key isnt there. Defaults to '__report'.

        Returns:
            dict: New field lookup dict
        """

        out_filter = {}
        for key in list(listfilter.keys()):
            if replace in key:
                new_key = key.replace(replace, '')
            else:
                new_key = _append + key
            out_filter[new_key] = listfilter.pop(key)
        return out_filter

    @ERRORREPORT_LIST_QUERY_TIMER.time()
    def get_queryset(self):
        listfilter = self.build_list_filter(self.request)
        return ErrorReport.objects.filter(**listfilter).order_by('-reportTime').distinct()

    @classmethod
    @PARETO_QUERY_TIMER.time()
    def create_pareto(cls, field_lookup, listfilter=None):
        """Create pareto data.

        Field_lookup determines which field in the exception will be grouped
        and aggregated.

        Args:
            field_lookup (str): field lookup string
            listfilter (dict, optional): dictionary of filter params. Defaults to None.

        Returns:
            QuerySet: The filtered and aggregated queryset
        """
        if listfilter is None:
            listfilter = {}

        value_dict = {"value": F(field_lookup)}
        count_dict = {"count": Count(field_lookup)}
        qs = AFTException.objects.filter(
            **listfilter
        ).values(
            **value_dict
        ).annotate(
            **count_dict
        )

        return qs

    @action(
        methods=['get'],
        url_path='pareto',
        detail=False,
        renderer_classes=[JSONRenderer]
    )
    def pareto(self, request):
        listfilter = self.build_list_filter(request)
        listfilter = self.swap_foreign_key_relation_lookup(listfilter)

        pareto_group = request.query_params.get("aggregate_query", "code__code")
        pareto_name = request.query_params.get("aggregate_name", None)

        query_set = ErrorReportView.create_pareto(pareto_group, listfilter)
        return make_ok(
            f"Pareto generated: {pareto_name if pareto_name else 'Exceptions'}",
            ParetoSerializer(query_set, many=True, new_name=pareto_name).data
        )

    @action(
        methods=['Post'],
        url_path='createnotification',
        detail=False,
        renderer_classes=[JSONRenderer]
    )
    def create_notification(self, request):
        criteria = self.build_list_filter(request)
        trigger_on = ErrorReport.__name__
        recipients = request.data.get("recipients")
        notification = {
            "criteria": criteria,
            "trigger_on": trigger_on,
            "recipients": recipients
        }
        
        serializer = NotificationSerializer(data=notification)
        serializer.is_valid()
        serializer.save(creator=request.user)
        return make_ok("Notification created", serializer.data)

