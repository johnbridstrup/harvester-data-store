from common.celery import monitored_shared_task
from .models import ChatbotLog


@monitored_shared_task
def send_to_slack(log_id: int):
    log = ChatbotLog.objects.get(id=log_id)
    print(f"Sending log to slack: {log}")
