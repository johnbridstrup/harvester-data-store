# Generated by Django 4.1 on 2023-04-18 23:04

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('harvester', '0005_harvester_thingname_historicalharvester_thingname'),
    ]

    operations = [
        migrations.AddIndex(
            model_name='harvester',
            index=models.Index(fields=['harv_id'], name='harvester_h_harv_id_23a708_idx'),
        ),
        migrations.AddIndex(
            model_name='harvester',
            index=models.Index(fields=['is_emulator'], name='harvester_h_is_emul_9f0a1e_idx'),
        ),
    ]
