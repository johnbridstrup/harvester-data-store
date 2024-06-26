from common.filters import CommonInfoFilterset, DTimeFilter, filters

from .models import Fruit, Harvester, HarvesterSwInfo


class FruitFilterset(CommonInfoFilterset):
    class Meta:
        model = Fruit
        fields = CommonInfoFilterset.FIELDS_BASE


class HarvesterFilterset(CommonInfoFilterset):
    class Meta:
        model = Harvester
        fields = CommonInfoFilterset.FIELDS_BASE + [
            "harv_id",
            "fruit__name",
            "name",
        ]


class HarvesterSWInfoFilterset(CommonInfoFilterset):
    start_time = DTimeFilter(field_name="deployed_ts", lookup_expr="gte")
    end_time = DTimeFilter(field_name="deployed_ts", lookup_expr="lte")
    harv_id = filters.CharFilter(field_name="harvester__harv_id")

    class Meta:
        model = HarvesterSwInfo
        fields = CommonInfoFilterset.FIELDS_BASE + [
            "githash",
            "dirty",
            "branchname",
            "deployer",
        ]
