from prometheus_client import Gauge

from common.async_metrics import prometheus_get_registry


MISSING_SERIAL_NUMBER = Gauge(
    "hds_asset_missing_sn",
    "Gauge for assets missing serial numbers",
    labelnames=["harv_id", "index", "asset_type"],
    registry=prometheus_get_registry(),
)