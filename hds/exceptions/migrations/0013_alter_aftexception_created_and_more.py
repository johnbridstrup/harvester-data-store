# Generated by Django 4.0.4 on 2023-12-11 21:13

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("exceptions", "0012_alter_aftexception_report"),
    ]

    operations = [
        migrations.AlterField(
            model_name="aftexception",
            name="created",
            field=models.DateTimeField(auto_now_add=True, db_index=True),
        ),
        migrations.AlterField(
            model_name="aftexceptioncode",
            name="created",
            field=models.DateTimeField(auto_now_add=True, db_index=True),
        ),
        migrations.AlterField(
            model_name="aftexceptioncodemanifest",
            name="created",
            field=models.DateTimeField(auto_now_add=True, db_index=True),
        ),
    ]
