# Generated by Django 4.0.4 on 2023-01-20 23:02

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("exceptions", "0010_aftexception_primary"),
    ]

    operations = [
        migrations.AlterField(
            model_name="aftexception",
            name="primary",
            field=models.BooleanField(blank=True, null=True),
        ),
    ]
