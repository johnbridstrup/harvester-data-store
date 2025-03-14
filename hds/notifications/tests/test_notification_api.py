from unittest.mock import patch
from urllib.parse import urlencode

from rest_framework import status

from common.tests import HDSAPITestBase
from errorreport.models import ErrorReport
from ..models import Notification


class NotificationAPITest(HDSAPITestBase):
    """Test Notification APIs"""

    def setUp(self):
        super().setUp()
        self.setup_basic()
        self.notification = {
            "trigger_on": "ErrorReport",
            "criteria": {"test_param": "1234"},
        }
        self.notifcation_inst = Notification.objects.create(
            **self.notification, creator=self.user
        )
        self.notifcation_inst.recipients.set([1])

    def test_create_notification(self):
        """create notifications and assert it exists"""
        params = {
            "harv_ids": 11,
            "locations": "Ranch A",
            "fruits": "apple",
            "codes": 0,
        }
        criteria = {
            "harvester__harv_id__in": ["11"],
            "location__ranch": ["Ranch A"],
            "harvester__fruit__name__in": ["apple"],
            "exceptions__code__code__in": ["0"],
        }
        self.notification["recipients"] = [self.user.id]
        resp = self.client.post(
            f"{self.notif_url}?{urlencode(params)}",
            data=self.notification,
            format="json",
        )

        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Notification.objects.count(), 2)
        obj = Notification.objects.get(id=resp.data["id"])
        self.assertDictEqual(criteria, obj.criteria)

    def test_delete_notification(self):
        self.assertEqual(Notification.objects.count(), 1)
        r = self.client.delete(self.notif_det_url(1))
        self.assertEqual(Notification.objects.count(), 0)

    def test_update_notification_disallowed(self):
        """update notifications and assert it exists"""

        # PUT not allowed
        resp = self.client.put(
            self.notif_det_url(1), self.notification, format="json"
        )

        self.assertEqual(resp.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)

    @patch("notifications.tasks.check_notifications.delay")
    @patch("notifications.tasks.post_to_slack_task.delay")
    def test_notification_tasks(self, post_to_slack_task, check_notifications):
        self.post_error_report()

        self.assertEqual(post_to_slack_task.call_count, 1)
        self.assertEqual(check_notifications.call_count, 1)

        report = ErrorReport.objects.get(id=1)
        ptst_args = post_to_slack_task.call_args.args
        check_notif_args = check_notifications.call_args.args

        self.assertEqual(f"h{report.harvester.harv_id}_dev", ptst_args[1])
        self.assertEqual("errorreport", check_notif_args[0])
        self.assertEqual("ErrorReport", check_notif_args[1])
        self.assertEqual(1, check_notif_args[2])

    @patch("notifications.models.Notification.notify")
    def test_notify_called(self, notify):
        self.post_error_report()

        self.assertFalse(notify.called)

        params = {
            "harvester__harv_id__in": [11],
            "harvester__fruit__name": "strawberry",
        }
        param_str = "&".join([f"{key}={val}" for key, val in params.items()])
        param_str = "?" + param_str
        notification = Notification.objects.create(
            creator=self.user,
            trigger_on=self.notification["trigger_on"],
            criteria=params,
        )
        notification.recipients.add(self.user)
        notification.save()

        resp = self.post_error_report()
        self.assertTrue(notify.called)

        notify_args = notify.call_args.args
        self.assertIn("Error on Harvester", notify_args[0])
        self.assertIn("errorreports/2", notify_args[1])
        self.assertNotIn("api/v1", notify_args[1])

    def test_get_notifications(self):
        r = self.client.get(self.notif_url)
        self.assertEqual(r.status_code, status.HTTP_200_OK)
        r = self.client.get(self.notif_det_url(1))
        self.assertEqual(r.status_code, status.HTTP_200_OK)

    def test_filter_notifications(self):
        user2 = self.create_user("new_user", "new_password")
        params = {
            "harvester__harv_id__in": [11],
            "harvester__fruit__name": "strawberry",
        }

        notification2 = Notification.objects.create(
            creator=user2,
            trigger_on=self.notification["trigger_on"],
            criteria=params,
        )
        notification2.recipients.add(self.user)
        notification2.save()

        notification3 = Notification.objects.create(
            creator=user2,
            trigger_on=self.notification["trigger_on"],
            criteria=params,
        )
        notification3.recipients.add(user2)
        notification3.save()

        # Assert two notifications exist
        r = self.client.get(self.notif_url)
        self.assertEqual(r.json()["data"]["count"], 3)

        # Get created by self.user
        r = self.client.get(f"{self.notif_url}?category=created")
        self.assertEqual(r.status_code, status.HTTP_200_OK)
        data = r.json()["data"]
        self.assertEqual(data["count"], 1)
        self.assertEqual(data["results"][0]["creator"], self.user.id)

        # Get self.user is recipient
        r = self.client.get(f"{self.notif_url}?category=is_recipient")
        self.assertEqual(r.status_code, status.HTTP_200_OK)
        data = r.json()["data"]
        self.assertEqual(data["count"], 2)
        self.assertEqual(data["results"][0]["creator"], user2.id)
        self.assertIn(
            {"username": self.user.username}, data["results"][0]["recipients"]
        )
        self.assertIn(
            {"username": self.user.username}, data["results"][1]["recipients"]
        )
