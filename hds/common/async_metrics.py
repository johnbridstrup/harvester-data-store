from prometheus_client import (
    CollectorRegistry,
    Counter,
    Histogram,
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


ASYNC_ERROR_COUNTER = Counter(
    "hds_async_error",
    "Errors on asynchronous tasks",
    labelnames=["task", "exception", "desc"],
    registry=prometheus_get_registry(),
)

TOTAL_ERROR_COUNTER = Counter(
    "hds_total_error",
    "Counts all errors that pass the exception handler",
    labelnames=["exception", "basename"],
    registry=prometheus_get_registry(),
)

ASYNC_UPLOAD_COUNTER = Counter(
    "hds_async_upload",
    "Upload size on asynchronous tasks",
    labelnames=["filetype"],
    registry=prometheus_get_registry(),
)

ASYNC_TASK_TIMER = Histogram(
    "hds_async_task_timer",
    "Celery task runtime histogram",
    labelnames=["task"],
    registry=prometheus_get_registry(),
)

ASYNC_TASK_COUNTER = Counter(
    "hds_async_task_exec_counter",
    "Number of times each task has executed",
    labelnames=["task"],
    registry=prometheus_get_registry(),
)
