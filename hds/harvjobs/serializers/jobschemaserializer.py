from rest_framework import serializers
from ..models import JobSchema, JobType


class JobSchemaSerializer(serializers.ModelSerializer):
    class Meta:
        model = JobSchema
        fields = ("__all__")
        read_only_fields = ("creator",)

    def to_internal_value(self, data):
        jobtype_name = data["jobtype"]
        jobtype = JobType.objects.get(name=jobtype_name)

        jobschema = {
            "jobtype": jobtype.id,
            "schema": data["schema"],
            "version": data["version"],
        }
        return super().to_internal_value(jobschema)

    def to_representation(self, instance):
        jobtype = instance.jobtype.name
        data = super().to_representation(instance)
        data['jobtype'] = jobtype
        
        return data