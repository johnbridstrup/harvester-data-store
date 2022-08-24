from celery import shared_task
from .models import Notification
from .slack import post_to_slack
from django.apps import apps
from django.core.exceptions import FieldError
from common.async_metrics import ASYNC_ERROR_COUNTER


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
        except FieldError:
            err = f"Bad parameters in notification {notification.id}"
            ASYNC_ERROR_COUNTER.labels("check_notification", "FieldError", err)


    return f"{num_notifications} notifications sent"

@shared_task
def post_to_slack_task(message, channel='hds-test'):
    r = post_to_slack(message, channel)
    return r