from common.filters import CommonInfoFilterset, TagListFilter

from .models import Event, PickSession


class EventFilterset(CommonInfoFilterset):
    tags = TagListFilter()
    class Meta:
        model = Event
        fields = CommonInfoFilterset.FIELDS_BASE + [
            "UUID",
        ]


class PickSessionFilterset(CommonInfoFilterset):
    tags = TagListFilter()
    class Meta:
        model = PickSession
        fields = CommonInfoFilterset.FIELDS_BASE + [
            "UUID",
        ]
