# Generated by Django 4.0.4 on 2022-08-25 20:01

from django.db import migrations, models
import django.db.models.deletion
from event.models import Event


def create_events(apps, schema_editor):
    Report = apps.get_model("errorreport", "ErrorReport")
    EventModel = apps.get_model("event", "Event")

    for report in Report.objects.all():
        UUID = report.report.get("uuid", Event.generate_uuid())
        creator = report.creator
        event = EventModel.objects.create(UUID=UUID, creator=creator)
        report.event = event
        report.save()


class Migration(migrations.Migration):

    dependencies = [
        ("event", "0001_initial"),
        ("errorreport", "0002_auto_20220722_1709"),
    ]

    operations = [
        migrations.AddField(
            model_name="errorreport",
            name="event",
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.CASCADE,
                to="event.event",
            ),
        ),
        migrations.RunPython(create_events),
    ]
