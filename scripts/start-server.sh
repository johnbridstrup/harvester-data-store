#!/usr/bin/env bash
# start-server.sh

cd hds; gunicorn hds.wsgi --user www-data --bind 0.0.0.0:$1 --workers 3
