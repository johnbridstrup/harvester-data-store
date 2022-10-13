from common.tests import HDSAPITestBase
from errorreport.models import ErrorReport
from ..models import Notification
from django.contrib.auth.models import User
from unittest.mock import patch

class NotificationAPITest(HDSAPITestBase):
    """ Test Notification APIs """
    def setUp(self):
        super().setUp()
        self.update_user_permissions_all(ErrorReport)
        self.test_objects = self._setup_basic()
        self.notification = {
            "trigger_on": "ErrorReport",
            "criteria": {
                "test_param": '1234'
            },
        }
        self.notifcation_inst = Notification.objects.create(
            **self.notification, creator = self.user
        )
        self.notifcation_inst.recipients.set([1])

    def test_create_notification_disallowed(self):
        """ create notifications and assert it exists """
        resp = self.client.post(
            f"{self.api_base_url}/notifications/", 
            data=self.notification, 
            format="json"
        )

        self.assertEqual(resp.status_code, 405)
        self.assertEqual(Notification.objects.count(), 1)

    def test_delete_notification(self):
        self.assertEqual(Notification.objects.count(), 1)
        self.client.delete(f"{self.api_base_url}/notifications/1/")
        self.assertEqual(Notification.objects.count(), 0)

    def test_update_notification_disallowed(self):
        """ update notifications and assert it exists """

        # PUT not allowed
        resp = self.client.put(
            f"{self.api_base_url}/notifications/1/", 
            self.notification,
            format="json"
        )

        self.assertEqual(resp.status_code, 405)

    @patch("notifications.tasks.check_notifications.delay")
    @patch("notifications.tasks.post_to_slack_task.delay")
    def test_notification_tasks(self, post_to_slack_task, check_notifications):
        self._post_error_report()

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
        self._post_error_report()

        self.assertFalse(notify.called)

        params = {
            "harvester__harv_id__in": [11],
            "harvester__fruit__name": "strawberry"
        }
        param_str = "&".join([f"{key}={val}" for key, val in params.items()])
        param_str = "?" + param_str
        notification = Notification.objects.create(
            creator=self.user,
            trigger_on=self.notification["trigger_on"],
            criteria=params
        )
        notification.recipients.add(self.user)
        notification.save()

        resp = self._post_error_report()
        self.assertTrue(notify.called)

        notify_args = notify.call_args.args
        self.assertIn("Error on Harvester", notify_args[0])
        self.assertIn("errorreports/2", notify_args[1])
        self.assertNotIn("api/v1", notify_args[1])
        
        