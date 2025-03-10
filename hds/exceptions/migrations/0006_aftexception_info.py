# Generated by Django 4.0.4 on 2022-09-19 21:41
from django.core.paginator import Paginator
from django.db import migrations, models
from errorreport.serializers.errorreportserializer import NO_VALUE_STR
import structlog

logger = structlog.get_logger(__name__)


def extract_info(apps, schema_editor):
    AFTException = apps.get_model("exceptions", "aftexception")
    ErrorReport = apps.get_model("errorreport", "errorreport")

    paginator = Paginator(AFTException.objects.all(), 1000)
    for page in range(1, paginator.num_pages + 1):
        logger.info(f"Page {page}")
        for exc in paginator.page(page).object_list:
            if exc.report.harvester.fruit.name == "apple":
                sys_key = "sysmon_ap.{}"
                mod = 0
                if exc.node > 6:
                    mod = 2  # apple reports think there are 8 robots
            else:
                sys_key = "sysmon.{}"
                mod = 0

            report = ErrorReport.objects.get(id=exc.report.id)
            sys_report = report.report["data"].get("sysmon_report", None)
            if sys_report:
                try:
                    key = sys_key.format(exc.node + mod)
                    serv_str = f"{exc.service}.{exc.robot}"
                    info = sys_report[key]["errors"][serv_str].get(
                        "value", NO_VALUE_STR
                    )
                except Exception as e:
                    logger.error(sys_report)
                    logger.error(f"PK: {exc.pk}")
                    logger.error(f"sysmon key: {key}")
                    logger.error(f"service string: {serv_str}")
                    raise e
            else:
                info = NO_VALUE_STR
            exc.info = info
            exc.save()


class Migration(migrations.Migration):

    dependencies = [
        ("exceptions", "0005_aftexception_robot"),
    ]

    operations = [
        migrations.AddField(
            model_name="aftexception",
            name="info",
            field=models.TextField(blank=True, null=True),
        ),
        migrations.RunPython(extract_info),
    ]
