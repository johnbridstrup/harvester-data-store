#!/bin/bash

set -eo pipefail

source venv/bin/activate

cd hds
python manage.py test
