from common.filters import CommonInfoFilterset

from .models import Event, PickSession


class EventFilterset(CommonInfoFilterset):
    class Meta:
        model = Event
        fields = CommonInfoFilterset.FIELDS_BASE + [
            "UUID",
        ]


class PickSessionFilterset(CommonInfoFilterset):
    class Meta:
        model = PickSession
        fields = CommonInfoFilterset.FIELDS_BASE + [
            "UUID",
        ]
