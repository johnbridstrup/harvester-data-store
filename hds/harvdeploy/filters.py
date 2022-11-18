from .models import HarvesterCodeRelease

import django_filters.rest_framework as filters


class ReleaseFilter(filters.FilterSet):
    fruit = filters.CharFilter(field_name="fruit__name")
    tags = filters.CharFilter(field_name='tags__name')

    class Meta:
        model = HarvesterCodeRelease
        fields = ['fruit', 'tags']