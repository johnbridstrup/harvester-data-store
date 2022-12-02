from common.tests import HDSAPITestBase
from django.urls import reverse
from django.utils.timezone import datetime, timedelta, make_aware
from rest_framework import status

from .models import MigrationLog


class HDSMigrationsTestCase(HDSAPITestBase):
    def setUp(self):
        super().setUp()
        self.update_user_permissions_all(MigrationLog)

        self.migration_log = MigrationLog(
            creator=self.user,
            startTime=make_aware(datetime.now()),
            endTime=make_aware(datetime.now() + timedelta(seconds=45)),
            result="success",
            output="SUCCESS!",
            githash="XXXXXX",
        )
        self.migration_log.save()
        self.url = reverse("hdsmigrations-list")

    def test_get_migration_logs(self):
        r = self.client.get(self.url)
        data = r.json()["data"]

        self.assertEqual(data["count"], 1)

    def test_disallowed_methods(self):
        status_codes = []
        status_codes.append(self.client.post(self.url).status_code)
        status_codes.append(self.client.put(self.url).status_code)
        status_codes.append(self.client.patch(self.url).status_code)
        status_codes.append(self.client.delete(self.url).status_code)
        
        self.assertTrue(all([s == status.HTTP_405_METHOD_NOT_ALLOWED for s in status_codes]))

    