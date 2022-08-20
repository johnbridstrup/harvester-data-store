from django.dispatch import receiver, Signal
from .tasks import check_notifications
from errorreport.models import ErrorReport


error_report_created = Signal()

@receiver(error_report_created)
def check_notify_reports(sender, instance_id, url, **kwargs):
    check_notifications.delay('errorreport', ErrorReport.__name__, instance_id, url)
