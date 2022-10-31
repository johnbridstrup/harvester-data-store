from celery import shared_task
from collections import defaultdict

from .models import Notification
from .slack import post_to_slack
from django.apps import apps
from django.core.exceptions import FieldError
from common.async_metrics import ASYNC_ERROR_COUNTER
from exceptions.models import AFTExceptionCode


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

@shared_task
def notify_operator_task(report_id):
    ErrorReport = apps.get_model('errorreport', 'errorreport')
    report_inst = ErrorReport.objects.get(id=report_id)
    harv_inst = report_inst.harvester
    exceptions = report_inst.exceptions.values("robot", "code__operator_msg", "info").distinct()

    msgs = defaultdict(set)
    
    for exc in exceptions:
        if "traychg" in exc['info']:
            robot = exc["info"].split("traychgunit.")[-1][0]
        else:
            robot = exc["robot"]
        msgs[exc["code__operator_msg"]].add(str(robot))

    if len(msgs) > 1:
        # Our codes inherit properties of their base exceptions.
        # We can assume that any messages that override this base
        # message are more specific, and thus take precedence. 
        base_code = AFTExceptionCode.objects.get(code=0)
        remove_msg = base_code.operator_msg
        msgs.pop(remove_msg, None)
    
    content = [{
        "type": "context",
        "elements": [{
            "type": "mrkdwn",
            "text": ":warning: *{}* ERROR! :warning:".format(harv_inst.name),
        }]
    }]
    for msg, robots in msgs.items():
        text = f"Robot(s) {', '.join(robots)}: {msg}"
        content_dict = {
            "type": "section",
            "text": {
                "type": "mrkdwn",
                "text": text,
            }
        }
        content.append(content_dict)

    message = {
        "channel": harv_inst.location.site_channel,
        "text": "*OPERATOR MESSAGE*",
        "blocks": content,
    }
    r = post_to_slack(message)
    return r