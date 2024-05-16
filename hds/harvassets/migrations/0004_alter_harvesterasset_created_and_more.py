# Generated by Django 4.0.4 on 2023-12-11 21:13

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("harvassets", "0003_alter_harvesterassetreport_reporttime"),
    ]

    operations = [
        migrations.AlterField(
            model_name="harvesterasset",
            name="created",
            field=models.DateTimeField(auto_now_add=True, db_index=True),
        ),
        migrations.AlterField(
            model_name="harvesterassetreport",
            name="created",
            field=models.DateTimeField(auto_now_add=True, db_index=True),
        ),
        migrations.AlterField(
            model_name="harvesterassettype",
            name="created",
            field=models.DateTimeField(auto_now_add=True, db_index=True),
        ),
        migrations.AlterField(
            model_name="historicalharvesterasset",
            name="created",
            field=models.DateTimeField(blank=True, db_index=True, editable=False),
        ),
    ]
