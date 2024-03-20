#!/bin/bash
set -e

SCRIPTDIR=$(dirname "$(realpath "$0")")
cd $SCRIPTDIR
if test -d venv; then
    echo "Virtual environment already exists"
else
    echo "Creating virtual environment"
    python3 -m venv venv
fi
source venv/bin/activate
pip install -r requirements.txt
