# Generated by Django 4.1 on 2023-12-07 16:25

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        (
            "emulatorstats",
            "0003_alter_emustatsreport_num_bed_collisions_and_more",
        ),
    ]

    operations = [
        migrations.AlterField(
            model_name="emustatsreport",
            name="reportTime",
            field=models.DateTimeField(blank=True, db_index=True, null=True),
        ),
    ]
