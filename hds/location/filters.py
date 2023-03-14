from common.filters import CommonInfoFilterset

from .models import Distributor, Location


class DistributorFilterset(CommonInfoFilterset):
    class Meta:
        model = Distributor
        fields = CommonInfoFilterset.FIELDS_BASE


class LocationFilterset(CommonInfoFilterset):
    class Meta:
        model = Location
        fields = CommonInfoFilterset.FIELDS_BASE
