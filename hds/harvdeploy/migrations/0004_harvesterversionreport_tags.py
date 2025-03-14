# Generated by Django 4.0.4 on 2022-11-11 00:00

from django.db import migrations
import taggit.managers


class Migration(migrations.Migration):

    dependencies = [
        ("taggit", "0005_auto_20220424_2025"),
        ("harvdeploy", "0003_harvesterversionreport_has_unexpected"),
    ]

    operations = [
        migrations.AddField(
            model_name="harvesterversionreport",
            name="tags",
            field=taggit.managers.TaggableManager(
                help_text="A comma-separated list of tags.",
                through="taggit.TaggedItem",
                to="taggit.Tag",
                verbose_name="Tags",
            ),
        ),
    ]
