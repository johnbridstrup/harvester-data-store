#!/bin/bash
# Set the port used by HDS

set -euo pipefail

: "${HDS_ROOT:=$PWD}"

# Function to get a random open port
get_random_port() {
    python -c 'import socket; s = socket.socket(); s.bind(("", 0)); print(s.getsockname()[1]); s.close()'
}

# Check if the Docker web container is running
if [ -z "$(sudo docker compose ps -q web)" ] || [ -z "$(sudo docker ps -q --no-trunc | grep $(sudo docker compose ps -q web))" ]; then
    echo "Setting port"
    DEFAULT_PORT=8085

    # Check if the default port is open
    if nc -zv localhost $DEFAULT_PORT > /dev/null 2>&1; then
        DEFAULT_PORT_OPEN=0
    else
        DEFAULT_PORT_OPEN=1
    fi

    # Determine the port to use
    if [ -z "${1-}" ]; then
        if [ -z "${HDS_PORT-}" ]; then
            if [ $DEFAULT_PORT_OPEN -eq 0 ]; then
                echo "Default port $DEFAULT_PORT unavailable"
                HDS_PORT=$(get_random_port)
            else
                HDS_PORT=$DEFAULT_PORT
            fi
        fi
    else
        if nc -zv localhost $1 > /dev/null 2>&1; then
            echo "Port $1 is unavailable"
            if [ $DEFAULT_PORT_OPEN -eq 0 ]; then
                echo "Assigning random port"
                HDS_PORT=$(get_random_port)
            else
                HDS_PORT=$DEFAULT_PORT
            fi
        else
            HDS_PORT=$1
        fi
    fi
else
    # If Docker container is already running, get the port
    PORT_MAPPING=$(sudo docker port hds-web-1)
    HDS_PORT=${PORT_MAPPING%%/*}
    echo "HDS already running on ${HDS_PORT}"
fi

export HDS_PORT

if [[ ! -x $HDS_ROOT/scripts/set_env.sh ]]; then
    echo "set_env.sh not found or not executable"
    exit 1
fi
source $HDS_ROOT/scripts/set_env.sh
