#!/usr/bin/env bash

export PROMETHEUS_MULTIPROC_DIR=/opt/app/multiproc-tmp

until [ -d $PROMETHEUS_MULTIPROC_DIR ]
do
    echo "Celery waiting for multiproc dir"
    sleep 1
done
