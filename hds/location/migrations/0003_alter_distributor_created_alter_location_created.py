# Generated by Django 4.0.4 on 2023-12-11 21:13

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("location", "0002_location_site_channel"),
    ]

    operations = [
        migrations.AlterField(
            model_name="distributor",
            name="created",
            field=models.DateTimeField(auto_now_add=True, db_index=True),
        ),
        migrations.AlterField(
            model_name="location",
            name="created",
            field=models.DateTimeField(auto_now_add=True, db_index=True),
        ),
    ]
