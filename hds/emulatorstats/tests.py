from common.tests import HDSAPITestBase

from .models import EmustatsReport


class EmustatsReportTestCase(HDSAPITestBase):
    def setUp(self):
        super().setUp()
        self.setup_basic()
        self.setup_urls()
        self.load_config_data()
        self.create_harvester_object(
            0,
            fruit=self.test_objects["fruit"],
            location=self.test_objects["location"],
            name="emu_harv",
            is_emu=True,
        )

    def test_basic(self):
        self.post_emustats_report()
        self.assertEqual(EmustatsReport.objects.count(), 1)

    def test_tags(self):
        self.post_emustats_report()

        rep = EmustatsReport.objects.get()
        tags = self.emustats_data["data"]["tag"]

        self.assertEqual(rep.tags.count(), len(tags))
        tag_list = [t.name for t in rep.tags.all()]

        self.assertListEqual(sorted(tags), sorted(tag_list))

    def test_filters(self):
        self.post_emustats_report()

        tags = self.emustats_data["data"]["tag"]
        runner0 = self.emustats_data["data"]["runner"]
        runner1 = "other_runner"

        self.emustats_data["data"]["tag"] = [tags[0]]
        self.post_emustats_report(load=False)

        self.emustats_data["data"]["tag"] = [tags[1]]
        self.post_emustats_report(load=False)

        self.emustats_data["data"]["tag"] = []
        self.emustats_data["data"]["runner"] = runner1
        self.post_emustats_report(load=False)

        rall = self.client.get(self.emustats_url)
        self.assertEqual(rall.json()["data"]["count"], 4)

        # Filter by a tags
        rt0 = self.client.get(f"{self.emustats_url}?tags={tags[0]}")
        self.assertEqual(rt0.json()["data"]["count"], 2)

        rt1 = self.client.get(f"{self.emustats_url}?tags={tags[1]}")
        self.assertEqual(rt1.json()["data"]["count"], 2)

        rt12 = self.client.get(f"{self.emustats_url}?tags={tags[1]},{tags[0]}")
        self.assertEqual(rt12.json()["data"]["count"], 1)

        # Filter by runner
        r0 = self.client.get(f"{self.emustats_url}?runner={runner0}")
        self.assertEqual(r0.json()["data"]["count"], 3)

        r1 = self.client.get(f"{self.emustats_url}?runner={runner1}")
        self.assertEqual(r1.json()["data"]["count"], 1)

        # Filter by site_name should return 0
        r2 = self.client.get(f"{self.emustats_url}?site_name=emulator_davis")
        self.assertEqual(r2.json()["data"]["count"], 0)

        # Filter by generic should return 0
        r2 = self.client.get(
            f"{self.emustats_url}?generic=report__data__site_name%3Demulator_davis"
        )
        self.assertEqual(r2.json()["data"]["count"], 0)

        self.emustats_data["data"]["site_name"] = "emulator_davis"
        self.post_emustats_report(load=False)

        # Filter by site_name should return 1
        r3 = self.client.get(f"{self.emustats_url}?site_name=emulator_davis")
        self.assertEqual(r3.json()["data"]["count"], 1)

        # Filter by generic should return 1
        r3 = self.client.get(
            f"{self.emustats_url}?generic=report__data__site_name%3Demulator_davis"
        )
        self.assertEqual(r3.json()["data"]["count"], 1)
