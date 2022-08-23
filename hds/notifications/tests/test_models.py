from django.contrib.auth.models import User
from ..models import Notification
from exceptions.tests.test_models import ExceptionTestBase


class NotificationTestCase(ExceptionTestBase):
    def _create_notification(self, trigger_on="AFTException", criteria=None):
        if criteria is None:
            criteria = {
                "code__code": 0
            }

        self.creator = User.objects.get(id=1)

        notification = {
            "trigger_on": trigger_on,
            "criteria": criteria,
        }
        notification_obj = Notification.objects.create(creator=self.creator, **notification)

        return notification_obj

    def _add_recipient(self, instance, user):
        instance.recipients.add(user)
        instance.save()
        
        return instance

    def test_create_notification(self):
        notification = self._create_notification()
        
        self.assertEqual(Notification.objects.count(), 1)
        self.assertEqual(
            str(notification),
            "Notify  when AFTException has {'code__code': 0}"
        )

    def test_add_reciepients(self):
        notification = self._create_notification()
        notification = self._add_recipient(notification, self.creator)
        
        self.assertEqual(len(notification.recipients.all()), 1)
        self.assertEqual(len(self.creator.user_notifications.all()), 1)
        self.assertEqual(
            str(notification),
            "Notify test_user when AFTException has {'code__code': 0}"
        )
        
