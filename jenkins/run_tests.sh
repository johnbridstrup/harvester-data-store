#!/bin/bash

set -eo pipefail

VENV="./venv"

if [ ! -d $VENV ]
then
    echo ""
    echo "Creating venv"
    sudo apt install -y python3-venv
    python3 -m venv $VENV
fi
echo "" && echo "Activating venv"
source $VENV/bin/activate

pip install -r requirements.txt

cd hds
python manage.py test
