import jsonschema

from django.forms import ValidationError
from django_celery_beat.models import (
    PeriodicTask,
    CrontabSchedule,
    IntervalSchedule,
    ClockedSchedule
)
from rest_framework import serializers
from timezone_field.rest_framework import TimeZoneSerializerField

from harvester.models import Harvester
from harvester.serializers.harvesterserializer import HarvesterMinimalSerializer
from harvjobs.models import JobSchema
from harvjobs.serializers.jobserializer import JobSerializer
from .models import ScheduledJob


class ScheduleFormMixin:
    @classmethod
    def get_schema(cls):
        raise NotImplementedError(f"{cls.__name__} schema not defined")


class ClockedScheduleSerializer(serializers.ModelSerializer, ScheduleFormMixin):
    class Meta:
        model = ClockedSchedule
        fields = ('__all__')

    @classmethod
    def get_schema(cls):
        return {
            "type": "object",
            "properties": {
                "clocked_time": {
                    "type": "string",
                    "format": "date-time",
                }
            }
        }


class IntervalScheduleSerializer(serializers.ModelSerializer, ScheduleFormMixin):
    class Meta:
        model = IntervalSchedule
        fields = ('__all__')

    @classmethod
    def get_schema(cls):
        return {
            "type": "object",
            "properties": {
                "every": {
                    "type": "integer",
                    "description": "Number of periods between execution.",
                    "minimum": 1,
                },
                "period": {
                    "type": "string",
                    "description": "Seconds/minutes/days/...",
                    "enum": [
                        IntervalSchedule.SECONDS,
                        IntervalSchedule.MINUTES,
                        IntervalSchedule.HOURS,
                        IntervalSchedule.DAYS,
                    ]
                }
            },
            "required": ["every", "period"],
        }


class CronTabScheduleSerializer(serializers.ModelSerializer, ScheduleFormMixin):
    timezone = TimeZoneSerializerField(use_pytz=True)

    class Meta:
        model = CrontabSchedule
        fields = ('__all__')

    @classmethod
    def get_schema(cls):
        return {
            "type": "object",
            "properties": {
                "timezone": {
                    "type": "string",
                    "description": "Timezone to execute.",
                    "default": "UTC",
                },
                "minute": {
                    "type": "string",
                    "description": "Cron minutes to run. Use * for all.",
                    "default": "*",
                    "examples": ["5", "0,30"],
                },
                "hour": {
                    "type": "string",
                    "description": "Cron hours to run. Use * for all.",
                    "default": "*",
                    "examples": ["0", "0,12"],
                },
                "day_of_week": {
                    "type": "string",
                    "description": "Cron days of the week to run. Use * for all.",
                    "default": "*",
                    "examples": ["1", "2,6"]
                },
                "day_of_month": {
                    "type": "string",
                    "description": "Cron days of the month to run. Use * for all.",
                    "default": "*",
                    "examples": ["1", "10,20", "10-20"]
                },
                "month_of_year": {
                    "type": "string",
                    "description": "Cron months of the year to run. Use * for all.",
                    "default": "*",
                    "examples": ["1", "1,4,7,10"]
                },
            },
            "required": [
                "minute",
                "hour",
                "day_of_week",
                "day_of_month",
                "month_of_year",
            ],
        }


class PeriodicTaskSerializer(serializers.ModelSerializer):
    interval = IntervalScheduleSerializer()
    crontab = CronTabScheduleSerializer()
    clocked = ClockedScheduleSerializer()

    class Meta:
        model = PeriodicTask
        fields = ('__all__')


class ScheduledJobSerializer(serializers.ModelSerializer):
    task = PeriodicTaskSerializer(read_only=True)
    class Meta:
        model = ScheduledJob
        fields = ('__all__')
        read_only_fields = ('creator',)

    class Msgs:
        MISSING_KEY = "missing"
        NO_JOBTYPE = "jobtype"
        NO_VERS = "schema_version"
        NO_SCHEMA = lambda jt, sv: {"No Schema": f"{jt} version {sv} does not exist"}
        NO_PAYLOAD = "payload"
        NO_TARGETS = "targets"
        NO_SCHEDULE = "schedule"

    def to_internal_value(self, data):
        missing = []

        jobtype = data.get("jobtype")
        if jobtype is None:
            missing.append(self.Msgs.NO_JOBTYPE)
        
        schema_version = data.get("schema_version")
        if schema_version is None:
            missing.append(self.Msgs.NO_VERS)

        targets = data.get("targets")
        if targets is None:
            missing.append(self.Msgs.NO_TARGETS)
        
        schedule = data.get("schedule")
        if schedule is None:
            missing.append(self.Msgs.NO_SCHEDULE)

        if len(missing):
            raise serializers.ValidationError({self.Msgs.MISSING_KEY: missing})
        
        errs = {}
        try:
            schema = JobSchema.objects.get(
                jobtype__name=jobtype,
                version=schema_version,
            )
        except JobSchema.DoesNotExist:
            errs.update(self.Msgs.NO_SCHEMA(jobtype, schema_version))
        
        payload = data.get("payload", {}).get("payload")
        if payload is None:
            errs[self.Msgs.MISSING_KEY] = self.Msgs.NO_PAYLOAD

        if errs:
            raise serializers.ValidationError(errs)
        
        try:
            jsonschema.validate(payload, schema.dynamic_schema["properties"]["payload"])
        except jsonschema.ValidationError as e:
            raise serializers.ValidationError({"invalid": e})
        
        targets = self._parse_targets(data["targets"])
        internal_data = {
            "job_def": { **data },
            "targets": targets,
        }
        return super().to_internal_value(internal_data)

    def _parse_targets(self, target_dict):
        if target_dict.get("all"):
            return self._harv_pks_all()

        ranches = target_dict.get("ranches", None)
        fruits = target_dict.get("fruits", None)
        harvesters = target_dict.get("harvesters", None)
        if sum([ranches is not None, fruits is not None, harvesters is not None]) > 1:
            raise ValidationError("Provided multiple target options.")

        if ranches:
            return self._harv_pks_from_ranch(ranches)

        if fruits:
            return self._harv_pks_from_fruit(fruits)

        if harvesters:
            return self._harv_pks_from_harvname(harvesters)

        raise serializers.ValidationError("Target options incorrect or not provided.")

    @staticmethod
    def _harv_pks_from_ranch(ranches):
        filter = {
            "is_emulator": False,
            "location__ranch__in": ranches,
        }
        harvs = Harvester.objects.filter(**filter).values_list("id", flat=True)
        return list(harvs)

    @staticmethod
    def _harv_pks_from_fruit(fruits):
        filter = {
            "is_emulator": False,
            "fruit__name__in": fruits,
        }
        harvs = Harvester.objects.filter(**filter).values_list("id", flat=True)
        return list(harvs)

    @staticmethod
    def _harv_pks_from_harvname(harvesters):
        filter = {
            "is_emulator": False,
            "name__in": harvesters,
        }
        harvs = Harvester.objects.filter(**filter).values_list("id", flat=True)
        return list(harvs)

    @staticmethod
    def _harv_pks_all():
        filter = {
            "is_emulator": False,
        }
        harvs = Harvester.objects.filter(**filter).values_list("id", flat=True)
        return list(harvs)


class ScheduledJobDetailSerializer(ScheduledJobSerializer):
    """
    Return a response with full nesting to the detail view
    for any related objected.
    """
    jobs = JobSerializer(many=True)
    targets = HarvesterMinimalSerializer(many=True)

    class Meta(ScheduledJobSerializer.Meta):
        pass
