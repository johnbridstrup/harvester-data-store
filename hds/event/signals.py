from django.contrib.contenttypes.models import ContentType
from django.dispatch import receiver, Signal
from common.signals import report_created
from .models import Event
from .tasks import collect_aux_uuids

import logging


update_event_tag = Signal()

@receiver(update_event_tag)
def add_event_tag(sender, event_id, tag, **kwargs):
    try:
        event = Event.objects.get(id=event_id)
        event.tags.add(tag)
        event.save()
    except Event.DoesNotExist:
        logging.error(
            f"Event with id {event_id} does not exist!"
        )
        raise
    except:
        logging.error(
            f"Failed to add Event tag\n"
            f"Event: {event.UUID}\n"
            f"Tag: {tag}"
        )
        raise

@receiver(report_created)
def collect_linked_events(sender, app_label, pk, **kwargs):
    collect_aux_uuids.delay(app_label, sender, pk)
    