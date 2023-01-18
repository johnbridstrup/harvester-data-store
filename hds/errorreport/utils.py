from .metrics import PARETO_QUERY_TIMER
from common.reports import DTimeFormatter, DEFAULT_TZ
from common.viewsets import ReportModelViewSet
from exceptions.models import AFTException

from django.db.models import Count, F


def build_list_filter(request):
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
        tz = request.query_params.get('tz', DEFAULT_TZ)

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

        # Filter for emulator data
        if 'is_emulator' in request.query_params:
            is_emu = bool(int(request.query_params['is_emulator']))
            listfilter['harvester__is_emulator'] = is_emu

        # Filter for handled/unhandled errors
        if 'handled' in request.query_params:
            handled = bool(int(request.query_params['handled']))
            listfilter['exceptions__handled'] = handled

        # Primary exceptions flag
        if 'exceptions__primary' in request.query_params:
            primary = request.query_params['exceptions__primary'].lower() in ['1', 'true']
            listfilter['exceptions__primary'] = primary

        # update listfilter with generic query dict
        listfilter.update(ReportModelViewSet.build_generic_query(request))

        return listfilter

def pareto_list_filter(request, replace='exceptions__', _append='report__'):
    """Swap field lookup keys across foreign key relationship

        Args:
            request (request): Initial request
            replace (str, optional): Field lookup key to drop. Defaults to 'exceptions__'.
            _append (str, optional): Field lookup key to add when replace key isnt there. Defaults to '__report'.

        Returns:
            dict: New field lookup dict
        """
    listfilter = build_list_filter(request)

    out_filter = {}
    for key in list(listfilter.keys()):
        if replace in key:
            new_key = key.replace(replace, '')
        else:
            new_key = _append + key
        out_filter[new_key] = listfilter.pop(key)
    return out_filter

@PARETO_QUERY_TIMER.time() 
def create_pareto(field_lookup, listfilter=None):
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
