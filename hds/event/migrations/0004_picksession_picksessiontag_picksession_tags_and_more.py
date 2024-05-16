# Generated by Django 4.1 on 2023-02-08 23:01

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion
import taggit.managers


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ("taggit", "0005_auto_20220424_2025"),
        ("event", "0003_event_event_event_uuid_ea2b09_idx"),
    ]

    operations = [
        migrations.CreateModel(
            name="PickSession",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                ("created", models.DateTimeField(auto_now_add=True)),
                ("lastModified", models.DateTimeField(auto_now=True)),
                ("UUID", models.CharField(max_length=40, unique=True)),
                (
                    "creator",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="%(app_label)s_%(class)s_creator_related",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
                (
                    "modifiedBy",
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="%(app_label)s_%(class)s_modifiedby_related",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
            ],
            options={
                "abstract": False,
            },
        ),
        migrations.CreateModel(
            name="PickSessionTag",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                (
                    "content_object",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        to="event.picksession",
                    ),
                ),
                (
                    "tag",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="%(app_label)s_%(class)s_items",
                        to="taggit.tag",
                    ),
                ),
            ],
            options={
                "abstract": False,
            },
        ),
        migrations.AddField(
            model_name="picksession",
            name="tags",
            field=taggit.managers.TaggableManager(
                help_text="A comma-separated list of tags.",
                through="event.PickSessionTag",
                to="taggit.Tag",
                verbose_name="Tags",
            ),
        ),
        migrations.AddIndex(
            model_name="picksession",
            index=models.Index(fields=["UUID"], name="event_picks_UUID_026793_idx"),
        ),
    ]
