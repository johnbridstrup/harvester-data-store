#!/bin/bash

# Ensure migrations are up to date

set -eo pipefail

source venv/bin/activate

pushd hds
python manage.py makemigrations --check --dry-run
