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

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data['event'] = self.serialize_event(instance.event)
        return data

    def to_internal_value(self, data):
        report = data.copy()
        data, _ = self.extract_basic(report)
        UUID = self.extract_uuid(report)
        try:
            job = Job.objects.get(event__UUID=UUID)
            event = job.event
            event.tags.add(JobResults.__name__)
        except Job.DoesNotExist:
            job = None
            creator = self.get_user_from_request()
            event = self.get_or_create_event(UUID, creator, JobResults.__name__)

        data.update({
            "job": job.id,
            "event": event.id,
        })
        return super().to_internal_value(data)
