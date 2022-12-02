# Generated by Django 4.0.4 on 2022-12-02 00:29

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='MigrationLog',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('lastModified', models.DateTimeField(auto_now=True)),
                ('result', models.CharField(choices=[('failed', 'Fail'), ('pending', 'Pending'), ('success', 'Success')], default='pending', max_length=31)),
                ('startTime', models.DateTimeField(null=True)),
                ('endTime', models.DateTimeField(null=True)),
                ('output', models.TextField(null=True)),
                ('githash', models.CharField(max_length=40)),
                ('creator', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='%(app_label)s_%(class)s_creator_related', to=settings.AUTH_USER_MODEL)),
                ('modifiedBy', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='%(app_label)s_%(class)s_modifiedby_related', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'abstract': False,
            },
        ),
    ]
