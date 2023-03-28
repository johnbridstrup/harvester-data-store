from django.db.models import Count, F
from .metrics import PARETO_QUERY_TIMER


def sort_exceptions(excs):
    exc_list = list(excs)
    sorted_excs = sorted(exc_list, key=lambda exc: exc.timestamp)
    return sorted_excs


@PARETO_QUERY_TIMER.time()
def create_pareto(qs, field_lookup):
    """Create pareto data.

    Field_lookup determines which field in the exception will be grouped
    and aggregated.

    Args:
        qs (Queryset): The view filtered queryset
        field_lookup (str): field lookup string

    Returns:
        QuerySet: The filtered and aggregated queryset
    """

    value_dict = {"value": F(field_lookup)}
    count_dict = {"count": Count(field_lookup)}
    qs = qs.filter().values(
        **value_dict
    ).annotate(
        **count_dict
    )

    return qs
