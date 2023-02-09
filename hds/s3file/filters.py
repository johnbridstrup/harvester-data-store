from django_filters import rest_framework as filters

from common.filters import ListFilter
from .models import S3File

class S3FileFilter(filters.FilterSet):
    key = filters.CharFilter(field_name="key", lookup_expr="icontains")
    filetype = filters.CharFilter(field_name="filetype",lookup_expr="icontains")
    tags = ListFilter(field_name='event__tags__name')

    class Meta:
        model = S3File
        fields = ('key', 'filetype',)
