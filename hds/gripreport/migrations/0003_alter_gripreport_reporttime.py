# Generated by Django 4.1 on 2023-12-07 16:25

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("gripreport", "0002_gripreport_pick_session"),
    ]

    operations = [
        migrations.AlterField(
            model_name="gripreport",
            name="reportTime",
            field=models.DateTimeField(blank=True, db_index=True, null=True),
        ),
    ]
