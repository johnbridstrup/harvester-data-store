#!/bin/bash

# set -euo pipefail

install_docker() {
    echo "" && echo "Installing Docker"
    sudo apt update -y
    sudo apt install -y \
        ca-certificates \
        curl \
        gnupg \
        lsb-release

    if [ ! -f "/usr/share/keyrings/docker-archive-keyring.gpg" ]; then
        curl -fsSL https://download.docker.com/linux/ubuntu/gpg | \
            sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
        echo \
        "deb [arch=$(dpkg --print-architecture) \
            signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] \
            https://download.docker.com/linux/ubuntu \
            $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

        sudo apt update -y
    fi

    sudo apt install -y --allow-downgrades docker-ce docker-ce-cli containerd.io
    sudo groupadd docker || true
    sudo usermod -aG docker $USER
}

install_docker_compose() {
    echo "" && echo "Installing Docker Compose Plugin"
    sudo apt install -y --allow-downgrades docker-compose-plugin=2.21.0-1~ubuntu.20.04~focal
}

if command -v docker &> /dev/null; then
    echo ""
    echo "Docker is already installed. Skipping installation."
    echo "Using version"
    docker -v
else
    install_docker
fi

if docker compose version &> /dev/null; then
    version=$(docker compose version --short)
    if [ "$version" == "2.21.0" ]; then
        echo ""
        echo "Docker Compose plugin version v$version is already installed."
        echo "Skipping installation..."
    else
        echo ""
        echo "Docker Compose plugin version v$version is installed, but v2.21.0 is required."
        install_docker_compose
    fi
else
    install_docker_compose
fi
