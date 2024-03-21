#!/usr/bin/env bash

set -e
ROOTDIR=/opt/app/

cd $ROOTDIR/hds
celery -A hds beat -l INFO --scheduler django_celery_beat.schedulers:DatabaseScheduler
