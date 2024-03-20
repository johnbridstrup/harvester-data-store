#!/bin/bash
set -e

SCRIPTDIR=$(dirname "$(realpath "$0")")
cd $SCRIPTDIR
if test -d venv; then
    echo "Virtual environment already exists"
else
    ./setup.sh
fi

source venv/bin/activate
pip install -r requirements.txt
pyinstaller --onefile monitor.py
