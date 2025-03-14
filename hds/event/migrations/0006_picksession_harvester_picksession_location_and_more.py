# Generated by Django 4.1 on 2023-04-18 22:41

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ("location", "0002_location_site_channel"),
        ("harvester", "0005_harvester_thingname_historicalharvester_thingname"),
        ("event", "0005_event_secondary_events"),
    ]

    operations = [
        migrations.AddField(
            model_name="picksession",
            name="harvester",
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.CASCADE,
                to="harvester.harvester",
            ),
        ),
        migrations.AddField(
            model_name="picksession",
            name="location",
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.CASCADE,
                to="location.location",
            ),
        ),
        migrations.AddField(
            model_name="picksession",
            name="session_length",
            field=models.DurationField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name="picksession",
            name="start_time",
            field=models.DateTimeField(blank=True, null=True),
        ),
    ]
