# Generated by Django 4.0.4 on 2022-11-10 20:17
from ..models import HarvesterVersionReport as HVR

from django.core.paginator import Paginator
from django.db import migrations, models
import structlog

logger = structlog.get_logger(__name__)


def set_has_unexpected(apps, schema_editor):
    HarvesterVersionReport = apps.get_model('harvdeploy', 'harvesterversionreport')

    paginator = Paginator(HarvesterVersionReport.objects.all(), 1000)
    for page in range(1, paginator.num_pages + 1):
        logger.info(f"Page {page}")
        for vers_report in paginator.page(page).object_list:
            vers_report.has_unexpected = HVR.check_unexpected(vers_report.report["data"])
            vers_report.save()


class Migration(migrations.Migration):

    dependencies = [
        ('harvdeploy', '0002_alter_harvestercoderelease_unique_together_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='harvesterversionreport',
            name='has_unexpected',
            field=models.BooleanField(default=False),
        ),
        migrations.RunPython(set_has_unexpected)
    ]
