from django.utils import timezone

from harvester.models import Fruit, Harvester
from harvjobs.models import JobSchema
from location.models import Location

from .serializers import CronTabScheduleSerializer, IntervalScheduleSerializer, ClockedScheduleSerializer


class JobschedulerForm:
    def __init__(
            self,
            jobtype,
            version,
            schema,
            fruits,
            locations,
            harvesters,
        ):
        self.jobtype = jobtype
        self.version = version
        self.schema: JobSchema = schema
        self.fruits = fruits
        self.locations = locations
        self.harvesters = harvesters

    def create(self):
        form = self._create_initial_form()
        return form

    def _create_initial_form(self):
        return {
            "type": "object",
            "title": f"Schedule {self.jobtype}: version {self.version}",
            "required": ["payload", "schedule", "targets", "jobtype", "schema_version"],
            "properties": {
                "jobtype":{
                    "type": "string",
                    "default": self.jobtype,
                },
                "schema_version": {
                    "type": "string",
                    "default": self.version,
                },
                "schedule": {
                    "type": "object",
                    "description": "Job Schedule",
                    "oneOf": [
                        {
                            "title": "Interval",
                            "required": ["interval"],
                            "properties": {
                                "interval": IntervalScheduleSerializer.get_schema(),
                            },
                            "additionalProperties": False,
                        },
                        {
                            "title": "Crontab",
                            "required": ["crontab"],
                            "properties": {
                                "crontab": CronTabScheduleSerializer.get_schema(),
                            },
                            "additionalProperties": False,
                        },
                        {
                            "title": "Clocked",
                            "required": ["clocked"],
                            "properties": {
                                "clocked": ClockedScheduleSerializer.get_schema(),
                            }
                        },
                    ],
                },
                "max_runs": {
                    "type": "integer",
                    "default": 10,
                },
                "targets": {
                    "type": "object",
                    "description": "Target options",
                    "oneOf": [
                        {
                            "title": "Ranch",
                            "required": ["ranches"],
                            "properties": {
                                "ranches": {
                                    "type": "array",
                                    "items": {
                                        "type": "string",
                                        "enum": self.locations,
                                    },
                                    "description": "Ranch object primary keys",
                                },
                            },
                        },
                        {
                            "title": "Fruit",
                            "required": ["fruits"],
                            "properties":{
                                "fruits": {
                                    "type": "array",
                                    "items": {
                                        "type": "string",
                                        "enum": self.fruits,
                                    },
                                    "description": "Fruit names",
                                },
                            },
                        },
                        {
                            "title": "Harvesters",
                            "required": ["harvesters"],
                            "properties": {
                                "harvesters": {
                                    "type": "array",
                                    "items": {
                                        "type": "string",
                                        "enum": self.harvesters,
                                    },
                                    "description": "Harvester names",
                                },
                            },
                        },
                        {
                            "title": "Fleet",
                            "required": ["all"],
                            "properties": {
                                "all": {
                                    "type": "boolean",
                                    "description": "Send to all harvesters.",
                                    "enum": [True],
                                },
                            },
                        },
                    ],
                },
                "payload": {
                    **self.schema.dynamic_schema,
                },
            },
        }


def create_job_scheduler_form(jobtype, schema_version):
    schema = JobSchema.objects.get(jobtype__name=jobtype,
                                   version=schema_version)
    fruits = list(Fruit.objects.values_list("name", flat=True))
    locations = list(Location.objects.values_list("ranch", flat=True))
    harvesters = list(Harvester.objects.filter(is_emulator=False).values_list("name", flat=True))

    form = JobschedulerForm(
        jobtype,
        schema_version,
        schema,
        fruits,
        locations,
        harvesters
    )

    return form.create()
    