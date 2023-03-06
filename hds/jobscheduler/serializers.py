from django_celery_beat.models import PeriodicTask, CrontabSchedule, IntervalSchedule, ClockedSchedule
from rest_framework import serializers
from timezone_field.rest_framework import TimeZoneSerializerField

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
