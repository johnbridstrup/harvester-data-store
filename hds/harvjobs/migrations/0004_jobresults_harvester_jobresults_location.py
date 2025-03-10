# Generated by Django 4.0.4 on 2023-01-20 23:02

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ("harvester", "0005_harvester_thingname_historicalharvester_thingname"),
        ("location", "0002_location_site_channel"),
        (
            "harvjobs",
            "0003_alter_historicaljob_jobstatus_alter_job_jobstatus_and_more",
        ),
    ]

    operations = [
        migrations.AddField(
            model_name="jobresults",
            name="harvester",
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.CASCADE,
                to="harvester.harvester",
            ),
        ),
        migrations.AddField(
            model_name="jobresults",
            name="location",
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                to="location.location",
            ),
        ),
    ]
