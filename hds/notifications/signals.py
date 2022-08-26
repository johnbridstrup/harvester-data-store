from django.dispatch import receiver, Signal
from .messages import REPORT_MSG_FMT
from .tasks import check_notifications, post_to_slack_task
from errorreport.models import ErrorReport


error_report_created = Signal()

@receiver(error_report_created)
def check_notify_reports(sender, instance_id, url, **kwargs):
    check_notifications.delay('errorreport', ErrorReport.__name__, instance_id, url)

@receiver(error_report_created)
def post_to_harv_dev(sender, instance_id, url, **kwargs):
    report_inst = ErrorReport.objects.get(id=instance_id)
    harv = report_inst.harvester
    channel = f"h{harv.harv_id}_dev"
    msg = str(report_inst)
    msg += f"{url}"

    post_to_slack_task.delay(msg, channel)
