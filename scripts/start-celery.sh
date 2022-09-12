#!/usr/bin/env bash
# start-celery.sh

set -e
cd hds

echo "Migrating"
python manage.py migrate

echo "Creating Superuser"
python manage.py initsuperuser

echo "Creating SQS Token"
python manage.py create_sqs_user

until [ -d /opt/app/multiproc-tmp ]
do
    echo "Celery waiting for multiproc dir"
    sleep 1
done

export PROMETHEUS_MULTIPROC_DIR=/opt/app/multiproc-tmp

cd /opt/app/hds/

celery -A hds worker -l INFO