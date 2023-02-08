# Generated by Django 4.1 on 2023-02-10 18:16

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('harvassets', '0001_initial'),
        ('autodiagnostics', '0003_autodiagnosticsreport_pick_session'),
    ]

    operations = [
        migrations.CreateModel(
            name='AutodiagnosticsRun',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('lastModified', models.DateTimeField(auto_now=True)),
                ('robot_id', models.IntegerField()),
                ('run_timestamp', models.DateTimeField()),
                ('ball_found_result', models.BooleanField()),
                ('result', models.BooleanField()),
                ('template_match_result', models.BooleanField(blank=True, null=True)),
                ('min_vac', models.FloatField(blank=True, null=True)),
                ('finger_open_value', models.FloatField(blank=True, null=True)),
                ('finger_closed_value', models.FloatField(blank=True, null=True)),
                ('finger_delta', models.FloatField(blank=True, null=True)),
                ('nominal_touch_force', models.FloatField(blank=True, null=True)),
                ('max_touch_force', models.FloatField(blank=True, null=True)),
                ('template_match_y_error', models.FloatField(blank=True, null=True)),
                ('sensors', models.JSONField(blank=True, null=True)),
                ('creator', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='%(app_label)s_%(class)s_creator_related', to=settings.AUTH_USER_MODEL)),
                ('gripper', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='harvassets.harvesterasset')),
                ('modifiedBy', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='%(app_label)s_%(class)s_modifiedby_related', to=settings.AUTH_USER_MODEL)),
                ('report', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='run_data', to='autodiagnostics.autodiagnosticsreport')),
            ],
            options={
                'abstract': False,
            },
        ),
    ]
