#!/bin/bash

# Set up the venv
VENV="./venv"

export HDS_ROOT="$( git rev-parse --show-toplevel )"

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

echo "" && echo "Installing Docker"
sudo apt update -y
sudo apt install -y \
    ca-certificates \
    curl \
    gnupg \
    lsb-release \
    prometheus

if [ ! -f "/usr/share/keyrings/docker-archive-keyring.gpg" ]
then
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | \
        sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
    echo \
    "deb [arch=$(dpkg --print-architecture) \
        signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] \
        https://download.docker.com/linux/ubuntu \
        $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

    sudo apt update -y
fi

sudo apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
sudo groupadd docker || true
sudo usermod -aG docker $USER

echo "" && echo "Checking for Docker Desktop install"

docker compose version


echo "" && echo "Checking if docker is installed properly"
docker run --name hello-world-container hello-world
docker rm hello-world-container

echo "" && echo "running install node script"
source $HDS_ROOT/scripts/install-node.sh

echo "" && echo "Start the development environment with"
echo "  source start.sh <optional port>"