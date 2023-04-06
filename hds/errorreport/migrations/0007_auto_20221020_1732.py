# Generated by Django 4.0.4 on 2022-10-20 17:32
from django.core.paginator import Paginator
from django.db import migrations
from common.models import Tags
from errorreport.models import DEFAULT_UNKNOWN
import structlog

logger = structlog.get_logger(__name__)


def extract_branch_hash(apps, schema_editor):
    ErrorReport = apps.get_model('errorreport', 'errorreport')

    paginator = Paginator(ErrorReport.objects.all(), 1000)
    for page in range(1, paginator.num_pages + 1):
        logger.info(f"Page {page}")
        for report in paginator.page(page).object_list:
            try:
                data = report.report["data"]
            except KeyError:
                logger.error(f"Report {report.id} has no 'data' key. Skipping.")
                logger.error(f"{report.report}")
                report.tags.add(Tags.INVALID)
                report.save()
                continue

            try:
                githash = data["githash"]
                if githash is None:
                    githash = DEFAULT_UNKNOWN
            except KeyError:
                logger.error((
                    f"Report {report.id} has no 'githash' key.\n" 
                    f"Continuing with default: {DEFAULT_UNKNOWN}."
                ))
                githash = DEFAULT_UNKNOWN
            try:
                gitbranch = data["branch_name"]
                if gitbranch is None:
                    gitbranch = DEFAULT_UNKNOWN
            except KeyError:
                logger.error((
                    f"Report {report.id} has no 'branch_name' key.\n" 
                    f"Continuing with default: {DEFAULT_UNKNOWN}."
                ))
                gitbranch = DEFAULT_UNKNOWN
            
            report.githash = githash
            report.gitbranch = gitbranch
            report.save()


class Migration(migrations.Migration):

    dependencies = [
        ('errorreport', '0006_errorreport_gitbranch_errorreport_githash'),
    ]

    operations = [
        migrations.RunPython(extract_branch_hash)
    ]
