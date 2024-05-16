#!/bin/bash

# Set up the venv
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

pip install -r requirements-dev.txt

scripts/install_docker.sh

echo "" && echo "Checking for Docker Desktop install"

docker compose version


echo "" && echo "Checking if docker is installed properly"
docker run --name hello-world-container hello-world
docker rm hello-world-container

echo "" && echo "Start the development environment with"
echo "  source start.sh <optional port>"
