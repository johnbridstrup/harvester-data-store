from common.filters import CommonInfoFilterset, DTimeFilter, ListFilter, TagListFilter

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
    harv_ids = ListFilter(field_type=int, field_name='harvester__harv_id')
    locations = ListFilter(field_name="location__ranch")
    start_time = DTimeFilter(field_name="start_time", lookup_expr="gte")
    end_time = DTimeFilter(field_name="start_time", lookup_expr="lte")
    
    class Meta:
        model = PickSession
        fields = CommonInfoFilterset.FIELDS_BASE + [
            "UUID",
        ]
