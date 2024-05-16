from prometheus_client import Counter, Gauge

from common.async_metrics import prometheus_get_registry


MISSING_SERIAL_NUMBER = Gauge(
    "hds_asset_missing_sn",
    "Gauge for assets missing serial numbers",
    labelnames=["harv_id", "index", "asset_type"],
    registry=prometheus_get_registry(),
)


class HarvAssetMonitor:
    REGISTRY = prometheus_get_registry()
    CURRENT_HARV_ID = Gauge(
        "hds_asset_harvester_id",
        "The harvester ID associated with an asset.",
        labelnames=["asset_type", "serial_number", "revision", "fruit"],
        registry=REGISTRY,
    )

    CURRENT_ROBOT = Gauge(
        "harvester_asset_robot_id",
        "The robot ID associated with an asset.",
        labelnames=["asset_type", "serial_number", "revision", "fruit"],
        registry=REGISTRY,
    )

    ASSET_NO_HISTORY = Counter(
        "hds_asset_no_history",
        "Asset has never been associated with a harvester",
        labelnames=["asset_type", "serial_number"],
        registry=REGISTRY,
    )

    @classmethod
    def get_fruit(cls, asset):
        # Get fruit from history, harvester field can be None
        try:
            fruit = asset.history.latest().harvester.fruit.name
        except:
            # This can only happen if an asset is created manually via API or admin panel
            fruit = "unknown"
            cls.ASSET_NO_HISTORY.labels(asset.asset.name, asset.serial_number).inc()
        return fruit

    @classmethod
    def _get_gauges(cls, asset):
        fruit = cls.get_fruit(asset)
        hgauge = cls.CURRENT_HARV_ID.labels(
            asset.asset.name,
            asset.serial_number,
            asset.version,
            fruit,
        )
        rgauge = cls.CURRENT_ROBOT.labels(
            asset.asset.name,
            asset.serial_number,
            asset.version,
            fruit,
        )
        return hgauge, rgauge

    @classmethod
    def removed_from_harvester(cls, asset):
        hgauge, rgauge = cls._get_gauges(asset)
        hgauge.set(-1)
        rgauge.set(-1)

    @classmethod
    def set_gauges(cls, asset):
        hgauge, rgauge = cls._get_gauges(asset)
        hgauge.set(asset.harvester.harv_id)
        rgauge.set(asset.index)

    @classmethod
    def version_update(cls, asset):
        fruit = cls.get_fruit(asset)
        cls.CURRENT_HARV_ID.remove(
            asset.asset.name,
            asset.serial_number,
            asset.version,
            fruit,
        )
        cls.CURRENT_ROBOT.remove(
            asset.asset.name,
            asset.serial_number,
            asset.version,
            fruit,
        )

    @classmethod
    def clear(cls):
        cls.CURRENT_HARV_ID.clear()
        cls.CURRENT_ROBOT.clear()
