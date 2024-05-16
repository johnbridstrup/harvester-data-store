from django.dispatch import receiver, Signal
from common.signals import report_created
from .models import Event
from .tasks import collect_aux_uuids

import structlog

logger = structlog.get_logger(__name__)


update_event_tag = Signal()


@receiver(update_event_tag)
def add_event_tag(sender, event_id, tag, **kwargs):
    try:
        event = Event.objects.get(id=event_id)
        event.tags.add(tag)
        event.save()
    except Event.DoesNotExist as e:
        exc = type(e).__name__
        logger.error(
            f"Event with id {event_id} does not exist!",
            event_id=event_id,
            exception_name=exc,
            exception_info=str(e),
        )
        raise
    except Exception as e:
        exc = type(e).__name__
        logger.error(
            f"Failed to add Event tag.",
            event_uuid=event.UUID,
            tag=tag,
            exception_name=exc,
            exception_info=str(e),
        )
        raise


@receiver(report_created)
def collect_linked_events(sender, app_label, pk, **kwargs):
    collect_aux_uuids.delay(app_label, sender, pk)
