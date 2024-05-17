# Generated by Django 4.1 on 2023-05-08 18:27

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ("event", "0006_picksession_harvester_picksession_location_and_more"),
        ("harvassets", "0001_initial"),
    ]

    operations = [
        migrations.AddField(
            model_name="harvesterassetreport",
            name="assets",
            field=models.ManyToManyField(
                related_name="linked_asset_reports",
                to="harvassets.harvesterasset",
            ),
        ),
        migrations.AddField(
            model_name="harvesterassetreport",
            name="pick_session",
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.CASCADE,
                to="event.picksession",
            ),
        ),
    ]
