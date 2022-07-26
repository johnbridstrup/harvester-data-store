#!/usr/bin/env bash
# start-server.sh

set -e
cd hds
echo "Migrating"
python manage.py migrate
echo "Creating Superuser"
python manage.py initsuperuser
echo "Starting"
gunicorn hds.wsgi --user www-data --bind 0.0.0.0:$1 --workers 3
