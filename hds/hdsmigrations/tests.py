from common.tests import HDSAPITestBase
from django.urls import reverse
from django.utils.timezone import datetime, timedelta, make_aware
from unittest.mock import patch
from rest_framework import status

from .models import MigrationLog
from .tasks import TEST_OUTPUT

import os


GIT_HASH = "test-git-hash"

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

    @patch.dict(os.environ, {"GITHASH": GIT_HASH})
    def test_migrate(self):
        # disallowed for non admin
        r = self.client.get(f"{self.url}migrate/")
        self.assertEqual(r.status_code, status.HTTP_403_FORBIDDEN)

        # allowed for admin
        self.user.is_superuser = True
        self.user.save()
        r = self.client.get(f"{self.url}migrate/")
        self.assertEqual(r.status_code, status.HTTP_202_ACCEPTED)
        self.assertEqual(MigrationLog.objects.count(), 2)

        log_id = r.json()["data"]["id"]
        log = MigrationLog.objects.get(id=log_id)
        self.assertEqual(log.result, MigrationLog.ResultChoices.SUCCESS)
        self.assertEqual(log.output, TEST_OUTPUT)

        self.assertEqual(GIT_HASH, log.githash)
    