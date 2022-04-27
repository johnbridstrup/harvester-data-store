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

pip install -r requirements.txt

echo "" && echo "Installing Docker"
sudo apt update -y
sudo apt install -y \
    ca-certificates \
    curl \
    gnupg \
    lsb-release

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

sudo apt install -y docker-ce docker-ce-cli containerd.io
sudo groupadd docker
sudo usermod -aG docker $USER

echo "" && echo "Checking for Docker Desktop install"

dpkg -l docker-desktop &> /dev/null
if [ $? -ne 0 ]; then
    echo "Installing Docker Desktop"
    curl https://desktop-stage.docker.com/linux/main/amd64/77103/docker-desktop.deb --output docker-desktop.deb
    sudo apt install -y ./docker-desktop.deb
fi

docker compose version


echo "" && echo "Checking if docker is installed properly"
docker run hello-world

echo "" && echo "Start the development environment with"
echo "  source start.sh <optional port>"