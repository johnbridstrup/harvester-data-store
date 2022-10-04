from common.serializers.reportserializer import ReportSerializerBase
from event.serializers import EventSerializerMixin
from ..models import JobResults, Job, JobHostResult

from rest_framework import serializers


class JobHostResultSerializer(serializers.ModelSerializer):
    class Meta:
        model = JobHostResult
        fields = ('__all__')
        read_only_fields = ('creator',)


class JobResultsSerializer(EventSerializerMixin, ReportSerializerBase):
    host_results = JobHostResultSerializer(many=True, read_only=True)
    class Meta:
        model = JobResults
        fields = ('__all__')
        read_only_fields = ('creator',)

    def to_internal_value(self, data):
        report = data.copy()
        reportTime = self.extract_timestamp(data['timestamp'])
        UUID = data['uuid']
        try:
            job = Job.objects.get(event__UUID=UUID).id
        except Job.DoesNotExist:
            job = None

        data = {
            "report": report,
            "reportTime": reportTime,
            "job": job,
            "UUID": UUID,
        }
        return super().to_internal_value(data)
