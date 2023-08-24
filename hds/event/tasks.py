from collections.abc import Iterable
from django.apps import apps

from common.celery import monitored_shared_task
from .models import Event


@monitored_shared_task
def collect_aux_uuids(app, report_model, pk):
    Report = apps.get_model(app_label=app, model_name=report_model)
    report_inst = Report.objects.get(id=pk)
    if not hasattr(report_inst, "event"):
        return f"{report_model} does not have event field"

    aux_uuids = report_inst.report.get("aux_uuids", [])
    if not isinstance(aux_uuids, Iterable):
        return f"{aux_uuids} is not iterable"
    for aux_uuid in aux_uuids:
        try:
            event = Event.objects.get(UUID=aux_uuid)
        except Event.DoesNotExist:
            event = Event(
                creator=report_inst.creator,
                UUID=aux_uuid,
                tags=["secondary"]
            )
            event.save()
        report_inst.event.secondary_events.add(event)
    report_inst.event.save()
    report_inst.save()
    return "Aux uuids collected and events linked."