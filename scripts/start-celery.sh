#!/usr/bin/env bash
# start-celery.sh

set -e
ROOTDIR=/opt/app/
RUN_MIGRATIONS=${MIGRATE:-"false"}

cd $ROOTDIR/hds

echo "Running collectstatic"
python manage.py collectstatic --no-input

if [ "$RUN_MIGRATIONS" = "true" ]
then
    echo "Migrating"
    python manage.py migrate
fi

echo "Creating Superuser"
python manage.py initsuperuser

echo "Creating SQS Token"
python manage.py create_sqs_user

cd $ROOTDIR
./scripts/wait-for-multiproc.sh

cd $ROOTDIR/hds
celery -A hds worker -l INFO
