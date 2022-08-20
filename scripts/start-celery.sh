#!/bin/bash

cd /opt/app/hds/
celery -A hds worker -l INFO