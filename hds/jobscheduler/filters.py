from django_filters import rest_framework as filters

from common.filters import CommonInfoFilterset

from .models import ScheduledJob


class ScheduledJobFilterSet(CommonInfoFilterset):
    jobtype = filters.CharFilter(field_name='job_def__jobtype')
    schema_version = filters.CharFilter(field_name='job_def__schema_version')

    class Meta:
        model = ScheduledJob
        fields = CommonInfoFilterset.FIELDS_BASE
