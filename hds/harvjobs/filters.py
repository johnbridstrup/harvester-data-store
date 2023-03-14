from common.filters import CommonInfoFilterset, ReportFilterset

from .models import Job, JobResults, JobSchema, JobType


class JobFilterset(CommonInfoFilterset):
    class Meta:
        model = Job
        fields = CommonInfoFilterset.FIELDS_BASE + [
            'target__harv_id',
            'schema__id',
            'schema__version',
            'event__UUID',
            'jobstatus',
        ]


class JobResultsFilterset(ReportFilterset):
    class Meta:
        model = JobResults
        fields = ReportFilterset.FIELDS_BASE + [
            'job__target__harv_id', 
            'job__event__UUID',
        ]


class JobSchemaFilterset(CommonInfoFilterset):
    class Meta:
        model = JobSchema
        fields = CommonInfoFilterset.FIELDS_BASE + [
            'jobtype__name',
        ]

class JobTypeFilterset(CommonInfoFilterset):
    class Meta:
        model = JobType
        fields = CommonInfoFilterset.FIELDS_BASE
