#!/bin/bash

set -euo pipefail

make migrate-dev
make load-fixtures

# Access the KEYFILE variable
KEYFILE=$1
echo ""
echo "Using key file: $KEYFILE"
echo ""

export GIT_SSH_COMMAND="ssh -i $KEYFILE -o UserKnownHostsFile=/dev/null -o StrictHostKeyChecking=no"

if [[ ! -x ./scripts/install_node.sh ]]; then
    echo "install_node.sh not found or not executable"
    exit 1
fi
source ./scripts/install_node.sh

if [[ ! -x ./scripts/newman.sh ]]; then
    echo "newman.sh not found or not executable"
    exit 1
fi
source ./scripts/newman.sh

echo ""
echo "Tear down"
sudo docker compose -f docker-compose.base.yml down -v --remove-orphans || { echo "Docker compose down failed"; exit 1; }

echo "Script completed successfully"
