# Generated by Django 4.0.4 on 2023-01-11 18:41

import common.utils
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("s3file", "0002_alter_s3file_bucket_alter_s3file_filetype_and_more"),
    ]

    operations = [
        migrations.AddField(
            model_name="s3file",
            name="file",
            field=models.FileField(
                blank=True, null=True, upload_to=common.utils.media_upload_path
            ),
        ),
        migrations.RemoveField(
            model_name="s3file",
            name="bucket",
        ),
        migrations.AlterField(
            model_name="s3file",
            name="key",
            field=models.CharField(blank=True, max_length=255, null=True),
        ),
    ]
