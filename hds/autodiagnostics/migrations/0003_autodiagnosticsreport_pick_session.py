# Generated by Django 4.1 on 2023-02-08 23:04

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ("event", "0004_picksession_picksessiontag_picksession_tags_and_more"),
        ("autodiagnostics", "0002_alter_autodiagnosticsreport_harvester"),
    ]

    operations = [
        migrations.AddField(
            model_name="autodiagnosticsreport",
            name="pick_session",
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.CASCADE,
                to="event.picksession",
            ),
        ),
    ]
