import copy
import jsonschema
import pytz
import structlog

from django.utils import timezone

from common.reports import LOG_TIMESTAMP_FMT, UTILITY_TIMESTAMP_FMT


ALLOW_REPEAT_KEY = "allow_repeat_schedules"
DYN_KEY_LIST_KEY = "dynamic_keys"

logger = structlog.getLogger(__name__)


class DynamicKey:
    """
    Abstract class representing a type of "dynamic key" in a jsonschema. The schema
    defined by children will represent a value that changes depending on when the job
    is scheduled. For instance, we may want a key that always uses the time the job
    was scheduled as a parameter for the job.
    """

    @classmethod
    def schema(cls, required):
        raise NotImplementedError(f"schema not implemented for {cls.__name__}")

    @classmethod
    def default_value_obj(cls):
        raise NotImplementedError(
            f"default_value_obj not implemented for {cls.__name__}"
        )

    @classmethod
    def name(cls):
        return cls.__name__

    @classmethod
    def validate(cls, obj):
        jsonschema.validate(obj, cls.schema())

    @classmethod
    def fill_with_defaults(cls, obj):
        d = cls.default_value_obj()
        d.update(obj)
        return d

    @classmethod
    def create_entry(cls, obj):
        cls.validate(obj)
        return cls.make_entry(obj)

    @classmethod
    def make_entry(cls, obj):
        raise NotImplementedError(
            f"make_entry not implemented for {cls.__name__}"
        )


class DynamicKeys:
    _DYN_KEYS = {}
    EXACT = "Exact"
    DYNAMIC_SELECTION = "selection"
    DYNAMIC_PREFIX = "__dynamic__"

    @classmethod
    def register(cls, DK: DynamicKey):
        cls._DYN_KEYS[DK.name()] = DK
        return DK

    @classmethod
    def create_dynamic_schema(cls, input_schema, properties):
        schema = copy.deepcopy(input_schema)
        for prop in properties:
            obj_schema = schema["properties"].pop(prop)
            dyn_key_name = cls._create_dyn_key_name(prop)
            required = prop in schema.get("required", [])
            if required:
                schema["required"].remove(prop)
                schema["required"].append(dyn_key_name)
            schema["properties"][dyn_key_name] = {
                "type": "object",
                "title": prop,
                "properties": {},
            }
            schema["properties"][dyn_key_name]["properties"].update(
                cls._generate_dynamic_options_prop()
            )
            schema["properties"][dyn_key_name][
                "allOf"
            ] = cls._create_allof_list(obj_schema)
        return schema

    @classmethod
    def create_entries(cls, dynamic_obj):
        obj = copy.deepcopy(dynamic_obj)
        for key in dynamic_obj.keys():
            if not cls.DYNAMIC_PREFIX in key:
                continue

            val = obj.pop(key)
            selection = val.pop(cls.DYNAMIC_SELECTION)
            recovered_key = key.replace(cls.DYNAMIC_PREFIX, "")

            if selection == cls.EXACT:
                obj[recovered_key] = val["value"]
                continue

            dyn_key: DynamicKey = cls._DYN_KEYS[selection]
            value_obj = val.get("value", {})
            full_val_obj = dyn_key.fill_with_defaults(value_obj)
            obj[recovered_key] = dyn_key.create_entry(full_val_obj)
        return obj

    @classmethod
    def _create_dyn_key_name(cls, prop):
        return f"{cls.DYNAMIC_PREFIX}{prop}"

    @classmethod
    def _generate_dynamic_options_prop(cls):
        opts = [cls.EXACT]
        opts += [name for name in cls._DYN_KEYS.keys()]
        return {
            cls.DYNAMIC_SELECTION: {
                "enum": opts,
            }
        }

    @classmethod
    def _create_allof_list(cls, original):
        if_thens = [
            {
                "if": {
                    "properties": {
                        cls.DYNAMIC_SELECTION: {
                            "const": cls.EXACT,
                        },
                    },
                },
                "then": {"properties": {"value": {**original}}},
            }
        ]
        if_thens.extend(
            [cls._create_dk_if_then(dk) for dk in cls._DYN_KEYS.values()]
        )
        return if_thens

    @classmethod
    def _create_dk_if_then(cls, dk: DynamicKey):
        dkschem = dk.schema()
        return {
            "if": {
                "properties": {
                    cls.DYNAMIC_SELECTION: {
                        "const": dk.name(),
                    },
                },
            },
            "then": {
                "properties": {
                    "value": {**dkschem},
                },
            },
        }


@DynamicKeys.register
class TimeOfSchedule(DynamicKey):
    @classmethod
    def schema(cls):
        neg_help = "Can be negative"
        return {
            "type": "object",
            "title": cls.name(),
            "properties": {
                "days": {
                    "type": "integer",
                    "default": 0,
                    "help": neg_help,
                },
                "hours": {
                    "type": "integer",
                    "default": 0,
                    "help": neg_help,
                },
                "minutes": {
                    "type": "integer",
                    "default": 0,
                    "help": neg_help,
                },
                "format": {"enum": [LOG_TIMESTAMP_FMT, UTILITY_TIMESTAMP_FMT]},
            },
        }

    @classmethod
    def default_value_obj(cls):
        return {
            "days": 0,
            "hours": 0,
            "minutes": 0,
            "format": UTILITY_TIMESTAMP_FMT,
        }

    @classmethod
    def make_entry(cls, obj):
        days = obj.get("days", 0)
        hours = obj.get("hours", 0)
        minutes = obj.get("minutes", 0)
        dt_format = obj.get("format")
        now = timezone.now().astimezone(pytz.timezone("US/PACIFIC"))
        then = now + timezone.timedelta(days=days, hours=hours, minutes=minutes)
        t_str = then.strftime(dt_format)

        return t_str
