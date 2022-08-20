from celery import shared_task
from .models import Notification
from django.apps import apps


@shared_task
def check_notifications(app_label, model_name, instance_id, url):
    notifications = Notification.objects.filter(trigger_on=model_name)
    model = apps.get_model(app_label=app_label, model_name=model_name)

    num_notifications = 0
    for notification in notifications:
        try:
            match = model.objects.filter(**notification.criteria).get(id=instance_id)
            notification.notify(str(match), url)
            num_notifications += 1

        except model.DoesNotExist:
            pass

    return f"{num_notifications} notifications sent"