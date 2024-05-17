import structlog
from io import StringIO
from django.core.management import call_command
from django.utils.timezone import datetime, make_aware

from common.celery import monitored_shared_task
from common.utils import test_env

from .models import MigrationLog


logger = structlog.get_logger(__name__)

TEST_OUTPUT = "We faked a migration"


@monitored_shared_task
def execute_migrations(id):
    log = MigrationLog.objects.get(id=id)
    try:
        last_success = MigrationLog.objects.filter(
            result=MigrationLog.ResultChoices.SUCCESS
        ).latest("endTime")
        last_hash = last_success.githash or "UNKNOWN"
    except MigrationLog.DoesNotExist:
        last_hash = "INITIAL"

    logger.info(
        "Beginning Migration", last_hash=last_hash, new_hash=log.githash
    )

    output = StringIO()
    startTime = make_aware(datetime.now())
    log.startTime = startTime
    if test_env():
        log.log_success(TEST_OUTPUT)
        return "Test complete"
    try:
        call_command("migrate", stdout=output)
    except Exception as e:
        exc = type(e).__name__
        logger.error(
            "An error occurred during migration!",
            exception_name=exc,
            exception_info=str(e),
            start_time=startTime,
            end_time=make_aware(datetime.now()),
            user=log.creator.username,
            user_id=log.creator.id,
        )
        try:
            log.log_fail(str(e))
        except Exception as log_err:
            exc = type(log_err).__name__
            logger.exception(
                "FAILED TO SAVE MIGRATION LOG! DATABASE MAY BE CORRUPTED!",
                exception_name=exc,
                exception_info=str(log_err),
                start_time=startTime,
                end_time=make_aware(datetime.now()),
                user=log.creator.username,
                user_id=log.creator.id,
            )
            raise
        raise

    log.log_success(output.getvalue())
    logger.info(str(log))
    return str(log)
