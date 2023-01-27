# Generated by Django 4.1 on 2023-01-27 18:57

import logging

from django.core.paginator import Paginator
from django.db import migrations


def update_file_key(apps, schema_editor):
    S3File = apps.get_model('s3file', 'S3File')
    paginator = Paginator(S3File.objects.all(), 1000)
    logging.info("Updating S3 File Table")
    for page in range(1, paginator.num_pages + 1):
        logging.info(f"Page {page}")
        for s3file in paginator.page(page).object_list:
            # We've updated the MediaStorage class so files need to be pointed correctly
            key = s3file.key
            if str(key).startswith('uploads'):
                key = f"media/{key}"
            s3file.file = s3file.key
            s3file.save()

class Migration(migrations.Migration):

    dependencies = [
        ('s3file', '0006_alter_s3file_file'),
    ]

    operations = [
        migrations.RunPython(update_file_key),
    ]
