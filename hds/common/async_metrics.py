from prometheus_client import (
    CollectorRegistry,
    Counter,
    multiprocess, 
    REGISTRY
)

import os


def prometheus_get_registry():
    if 'PROMETHEUS_MULTIPROC_DIR' in os.environ:
        registry = CollectorRegistry()
        multiprocess.MultiProcessCollector(registry)
    else:
        registry = REGISTRY
    return registry

ASYNC_ERROR_COUNTER = Counter(
    "hds_async_error", 
    "Errors on asynchronous tasks",
    labelnames=['task', 'exception', 'desc'],
    registry=prometheus_get_registry()
)