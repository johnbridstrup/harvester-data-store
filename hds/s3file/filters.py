from django_filters import rest_framework as filters

from common.filters import CommonInfoFilterset, EventUUIDFilter, TagListFilter
from .models import S3File

class S3FileFilter(CommonInfoFilterset):
    key = filters.CharFilter(field_name="key", lookup_expr="icontains")
    filetype = filters.CharFilter(field_name="filetype",lookup_expr="icontains")
    tags = TagListFilter(field_name='event__tags__name')
    uuid = EventUUIDFilter()

    class Meta:
        model = S3File
        fields = CommonInfoFilterset.FIELDS_BASE + [
            'key', 
            'filetype',
            'event__tags__name',
        ]
