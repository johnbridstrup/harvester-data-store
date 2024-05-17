from unittest import TestCase

from common.tests import HDSTestAttributes
from harvjobs.models import JobSchema, JobType
from harvjobs.dynamic_keys import (
    ALLOW_REPEAT_KEY,
    DYN_KEY_LIST_KEY,
    DynamicKey,
    DynamicKeys,
)
from ..forms import JobschedulerForm


class DynamicFormBuilderTestCase(TestCase, HDSTestAttributes):
    def setUp(self):
        super().setUp()
        self.setup_jobscheduler_data()
        self.DEFAULT_SCHEMA[ALLOW_REPEAT_KEY] = True
        self.DEFAULT_SCHEMA[DYN_KEY_LIST_KEY] = ["requiredArg"]

    def test_dynamic_properties(self):
        jt = JobType(self.DEFAULT_JOBTYPE)
        js = JobSchema(
            jobtype=jt,
            schema=self.DEFAULT_SCHEMA,
            version=self.DEFAULT_SCHEMA_VERSION,
        )
        form = JobschedulerForm(
            jobtype=self.DEFAULT_JOBTYPE,
            version=self.DEFAULT_SCHEMA_VERSION,
            schema=js,
            fruits=["banana"],
            locations=["somewhere-in-space"],
            harvesters=["Tesla-model-S"],
        )

        self.assertTrue(form.schema.allows_repeats)
        self.assertEqual(form.schema.dynamic_keys_list, ["requiredArg"])


class DynamicKeysTestCase(TestCase):
    def setUp(self):
        self.schema = {
            "type": "object",
            "properties": {
                "payload": {
                    "required": ["requiredArg"],
                    "properties": {"requiredArg": {"type": "string"}},
                }
            },
        }

    def test_register(self):
        self.assertGreater(len(DynamicKeys._DYN_KEYS), 0)

    def test_dynamic_opts(self):
        dyn_opts = DynamicKeys._generate_dynamic_options_prop()
        self.assertIn(DynamicKeys.DYNAMIC_SELECTION, dyn_opts)
        self.assertIn("enum", dyn_opts[DynamicKeys.DYNAMIC_SELECTION])
        self.assertGreater(
            len(dyn_opts[DynamicKeys.DYNAMIC_SELECTION]["enum"]), 0
        )

    def test_create_payload(self):
        to_update = ["requiredArg"]
        updated = DynamicKeys.create_dynamic_schema(
            self.schema["properties"]["payload"], to_update
        )
        self.assertNotEqual(updated, self.schema)

        dyn_key_name = DynamicKeys._create_dyn_key_name("requiredArg")

        self.assertIn(dyn_key_name, updated["required"])
        self.assertIn(dyn_key_name, updated["properties"])

        dk: DynamicKey
        for dk in DynamicKeys._DYN_KEYS.values():
            if_then = DynamicKeys._create_dk_if_then(dk)
            self.assertIn(if_then, updated["properties"][dyn_key_name]["allOf"])
