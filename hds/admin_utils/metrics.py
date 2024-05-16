from prometheus_client import Counter

from common.async_metrics import prometheus_get_registry


REGISTRY = prometheus_get_registry()
CRUDCOUNTER = Counter(
    "admin_crud_counter",
    "Counter for admin CRUD operations",
    labelnames=["model", "operation", "user"],
    registry=REGISTRY,
)


class AdminMetrics:
    @classmethod
    def incr_crud_operation(cls, model, operation, user):
        CRUDCOUNTER.labels(model, operation, user).inc()
