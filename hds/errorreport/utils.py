from .metrics import PARETO_QUERY_TIMER
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

        # get exception codes fromrequest and filter queryset for exception code
        if 'codes' in request.query_params:
            codes = request.query_params["codes"].split(",")
            if len(codes) > 0:
                listfilter['exceptions__code__code__in'] = codes

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
