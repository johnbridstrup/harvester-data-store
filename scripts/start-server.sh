#!/usr/bin/env bash
# start-server.sh

set -e
cd hds

echo "Creating Superuser"
python manage.py initsuperuser

echo "Creating SQS Token"
python manage.py create_sqs_user

echo "Creating prometheus multi-process directory"
if [ -d "/opt/app/multiproc-tmp" ]
then
    rm -rf /opt/app/multiproc-tmp
fi
mkdir /opt/app/multiproc-tmp
chown -R www-data:www-data /opt/app/multiproc-tmp
export PROMETHEUS_MULTIPROC_DIR=/opt/app/multiproc-tmp

echo "Starting"
gunicorn -c /opt/app/hds/gunicorn_conf.py hds.wsgi --user www-data --bind 0.0.0.0:$1 --workers 3
