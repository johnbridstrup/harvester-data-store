from common.tests import HDSAPITestBase
from ..models import Notification
from django.contrib.auth.models import User

class NotificationAPITest(HDSAPITestBase):
    """ Test Notification APIs """
    def setUp(self):
        super().setUp()
        self.test_objects = self._setup_basic()
        self.notification = {
            "trigger_on": "AFTException",
            "recipients": [1]
        }

    def test_create_notification(self):
        """ create notifications and assert it exists """
        resp = self.client.post(
            f'{self.api_base_url}/notifications/?test_param=1234', 
            data=self.notification, 
            format='json'
        )

        data = resp.json()['data']
        self.assertEqual(Notification.objects.count(), 1)
        self.assertDictEqual(data['criteria'], {'test_param': '1234'})

    def test_delete_notification(self):
        self.client.post(
            f'{self.api_base_url}/notifications/?test_param=1234', 
            data=self.notification, 
            format='json'
        )
        self.assertEqual(Notification.objects.count(), 1)
        self.client.delete(f'{self.api_base_url}/notifications/1/')
        self.assertEqual(Notification.objects.count(), 0)

    def test_update_notification(self):
        """ update notifications and assert it exists """
        self.client.post(
            f'{self.api_base_url}/notifications/?test_param=1234', 
            data=self.notification, 
            format='json'
        )     

        User.objects.create(username='test_user_2')
        new_notification = self.notification.copy()
        new_notification['recipients'] = [1, 2]

        resp = self.client.put(
            f'{self.api_base_url}/notifications/1/', 
            new_notification,
            format='json'
        )

        self.assertEqual(resp.status_code, 200)
        
        notification = Notification.objects.get(id=1)
        recipients = [user.username for user in notification.recipients.all()]

        self.assertTrue('test_user' in recipients)
        self.assertTrue('test_user_2' in recipients)

        # PATCH not allowed
        resp = self.client.patch(f'{self.api_base_url}/notifications/1/', new_notification)
        self.assertEqual(resp.status_code, 405)


