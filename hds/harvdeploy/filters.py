import django_filters.rest_framework as filters

from common.filters import CommonInfoFilterset, ReportFilterset, TagListFilter

from .models import HarvesterCodeRelease, HarvesterVersionReport


class ReleaseFilter(CommonInfoFilterset):
    fruit = filters.CharFilter(field_name="fruit__name")
    tags = TagListFilter()

    class Meta:
        model = HarvesterCodeRelease
        fields = CommonInfoFilterset.FIELDS_BASE + [
            'fruit', 
            'tags',
        ]

class VersionFilterset(ReportFilterset):
    class Meta:
        model = HarvesterVersionReport
        fields = ReportFilterset.FIELDS_BASE