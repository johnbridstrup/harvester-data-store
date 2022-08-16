from common.metrics import METHOD_TIMER


ERRORREPORT_LIST_QUERY_TIMER = METHOD_TIMER.labels("errorreport", "queryset")
PARETO_QUERY_TIMER = METHOD_TIMER.labels("errorreport", "pareto")