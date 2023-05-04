from common.filters import CommonInfoFilterset

from .models import Fruit, Harvester


class FruitFilterset(CommonInfoFilterset):
    class Meta:
        model = Fruit
        fields = CommonInfoFilterset.FIELDS_BASE


class HarvesterFilterset(CommonInfoFilterset):
    class Meta:
        model = Harvester
        fields = CommonInfoFilterset.FIELDS_BASE + [
            'harv_id', 
            'fruit__name',
            'name',
        ]
