#!/bin/bash

set -euo pipefail

echo ""
echo "Setting up environment"
export HDS_ROOT=$PWD

if [[ ! -x ./setup-venv.sh ]]; then
    echo "setup-venv.sh not found or not executable"
    exit 1
fi
source ./setup-venv.sh

echo ""
echo "Find open port"

if [[ ! -x ./scripts/set_port.sh ]]; then
    echo "set_port.sh not found or not executable"
    exit 1
fi
source ./scripts/set_port.sh

echo ""
echo "Spinning up test server"

make build-monitor || { echo "Failed to build monitor"; exit 1; }

sudo docker compose -f docker-compose.base.yml up -d --build --force-recreate || { echo "Docker compose up failed"; exit 1; }

# Loop to check if the server is up instead of fixed sleep
for i in {1..10}; do
    if curl -f localhost:${HDS_PORT} > /dev/null 2>&1; then
        echo "Server is up"
        break
    fi
    echo "Waiting for server to be up..."
    sleep 3
done

echo ""
echo "Confirm hosted on localhost:${HDS_PORT}"
echo ""

curl localhost:${HDS_PORT} > /dev/null
res1=$?
if test "$res1" != "0"; then
    echo "curl failed with: $res1"
    exit 1
fi
echo "curl successful"

echo "Script completed successfully"
