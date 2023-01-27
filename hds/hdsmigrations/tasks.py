from sys import stderr, stdout
from .models import MigrationLog
from common.celery import monitored_shared_task
from common.utils import test_env

from django.core.management import call_command
from django.utils.timezone import datetime, make_aware
from io import StringIO

import logging, traceback


TEST_OUTPUT = "We faked a migration"

@monitored_shared_task
def execute_migrations(id):
    log = MigrationLog.objects.get(id=id)
    try:
        last_success = MigrationLog.objects.filter(result=MigrationLog.ResultChoices.SUCCESS).latest("endTime")
        last_hash = last_success.githash or "UNKNOWN"
    except MigrationLog.DoesNotExist:
        last_hash = "INITIAL"

    logging.info("Beginning Migration")
    logging.info(f"\t{last_hash} -> {log.githash}")

    output = StringIO()
    startTime = make_aware(datetime.now())
    log.startTime = startTime
    if test_env():
        log.log_success(TEST_OUTPUT)
        return "Test complete"
    try:
        call_command("migrate", stdout=output)
    except Exception as e:
        logging.error("An error occurred during migration!")
        logging.error(f"\tStarted: {startTime}")
        logging.error(f"\tEnded {make_aware(datetime.now())}")
        try:
            log.log_fail(str(e))
        except Exception as log_err:
            logging.exception("FAILED TO SAVE MIGRATION LOG! DATABASE MAY BE CORRUPTED!")
            raise
        raise

    log.log_success(output.getvalue())
    logging.info(str(log))
    return str(log)