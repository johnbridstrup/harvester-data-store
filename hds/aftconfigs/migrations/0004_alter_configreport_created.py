# Generated by Django 4.0.4 on 2023-12-11 21:13

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('aftconfigs', '0003_alter_configreport_reporttime'),
    ]

    operations = [
        migrations.AlterField(
            model_name='configreport',
            name='created',
            field=models.DateTimeField(auto_now_add=True, db_index=True),
        ),
    ]
