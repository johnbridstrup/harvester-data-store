# Generated by Django 4.0.4 on 2022-10-20 17:32

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("errorreport", "0005_errorreport_tags"),
    ]

    operations = [
        migrations.AddField(
            model_name="errorreport",
            name="gitbranch",
            field=models.CharField(default="unknown", max_length=50),
        ),
        migrations.AddField(
            model_name="errorreport",
            name="githash",
            field=models.CharField(default="unknown", max_length=20),
        ),
    ]
