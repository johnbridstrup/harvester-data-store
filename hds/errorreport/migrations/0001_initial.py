# Generated by Django 4.0.4 on 2022-04-26 10:00

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('location', '0001_initial'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('harvester', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='ErrorReport',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('lastModified', models.DateTimeField(auto_now=True)),
                ('reportTime', models.DateTimeField(blank=True, null=True)),
                ('report', models.JSONField(blank=True, null=True)),
                ('creator', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='%(app_label)s_%(class)s_creator_related', to=settings.AUTH_USER_MODEL)),
                ('harvester', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='errorharvester', to='harvester.harvester')),
                ('location', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='errorlocation', to='location.location')),
                ('modifiedBy', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='%(app_label)s_%(class)s_modifiedby_related', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'abstract': False,
            },
        ),
    ]
