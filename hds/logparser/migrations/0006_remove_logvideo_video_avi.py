# Generated by Django 4.0.4 on 2023-01-12 21:22

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ("logparser", "0005_logvideo__video_avi_create_s3_files"),
    ]

    operations = [
        migrations.RemoveField(
            model_name="logvideo",
            name="video_avi",
        ),
    ]
