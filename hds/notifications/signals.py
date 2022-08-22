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
    codes = [exc.code.name for exc in report_inst.exceptions.all()]
    harv = report_inst.harvester
    channel = f"h{harv.harv_id}_dev"
    loc = report_inst.location

    msg = REPORT_MSG_FMT.format(
        code=', '.join(codes),
        harvester=harv.name,
        ts=report_inst.reportTime,
        location=loc.ranch,
        url=url
    )

    post_to_slack_task.delay(msg, channel)
