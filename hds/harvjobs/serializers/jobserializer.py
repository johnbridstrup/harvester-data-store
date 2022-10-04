import jsonschema
import re

from harvester.models import Harvester
from event.models import Event
from event.serializers import EventSerializerMixin
from ..models import Job, JobType, JobSchema
from ..serializers.jobresultsserializer import JobResultsSerializer

from django.urls import reverse
from rest_framework import serializers


DEFAULT_JOB_TIMEOUT = 6000


class JobSerializer(EventSerializerMixin, serializers.ModelSerializer):
    class Meta:
        model = Job
        fields = ('__all__')
        read_only_fields = ('creator',)

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data['results'] = reverse("jobresults-list") + (
            f"?job__target__harv_id={instance.target.harv_id}"
            f"&job__event__UUID={instance.event.UUID}"
        )
        data["history"] = reverse("job-detail", args=[instance.id]) + "history/"
        return data

    def to_internal_value(self, data):
        # Expects a job type, schema version
        jobtype_name = data['jobtype']
        jobschema_vers = data['schema_version']
        harv_id = data['target']

        jobtype = JobType.objects.get(name=jobtype_name)
        jobschema = JobSchema.objects.get(jobtype=jobtype, version=jobschema_vers)
        harvester = Harvester.objects.get(harv_id=harv_id)

        job_payload = self.construct_job_payload(jobtype.name, data["payload"])
        UUID = job_payload["id"]
        self._validate_payload(job_payload, jobschema.schema)

        data = {
            "schema": jobschema.id,
            "target": harvester.id,
            "payload": job_payload,
            "UUID": UUID,
        }

        return super().to_internal_value(data)

    @classmethod
    def _validate_payload(cls, payload, schema):
        try:
            jsonschema.validate(payload, schema)
        except jsonschema.ValidationError as e:
            if e.validator == "type":
                err = { 
                    "path": e.json_path,
                    "error": f"Must be {e.validator_value}"
                }
            elif e.validator == "required":
                err = {
                    "required": e.validator_value,
                    "missing": re.findall(r"'(?:[^']|'')*'* is a required property", str(e)), 
                }
            else:
                err = str(e)               
            
            raise serializers.ValidationError(detail={"validation error": err})

    @classmethod
    def construct_job_payload(cls, jobtype, payload):
        UUID = Event.generate_uuid()
        payload["id"] = UUID
        payload["job_type"] = jobtype
        if "timeout" not in payload:
            payload["timeout"] = DEFAULT_JOB_TIMEOUT


        return payload


class JobHistorySerializer(serializers.ModelSerializer):
    """Serialize jobstatus history from HistoricalRecords"""
    class Meta:
        model = Job.history.model
        fields = ('jobstatus', 'history_id', 'history_date')
        read_only_fields = ('__all__',)
