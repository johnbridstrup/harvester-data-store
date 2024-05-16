from prometheus_client import (
    Summary,
    Counter,
    CollectorRegistry,
    multiprocess,
    REGISTRY,
)
import os


def prometheus_get_registry():
    if "PROMETHEUS_MULTIPROC_DIR" in os.environ:
        registry = CollectorRegistry()
        multiprocess.MultiProcessCollector(registry)
    else:
        registry = REGISTRY
    return registry


METHOD_TIMER = Summary(
    "hds_method_time",
    "HDS method timer",
    labelnames=["view", "method"],
    registry=prometheus_get_registry(),
)
ERROR_COUNTER = Counter(
    "hds_error_counter",
    "Counter for HDS errors",
    labelnames=["Exception", "description", "raised_by"],
    registry=prometheus_get_registry(),
)
