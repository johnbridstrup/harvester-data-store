#!/bin/bash
# Set the port used by HDS

DEFAULT_PORT=8085
nc -zv localhost $DEFAULT_PORT > /dev/null 2>&1
DEF_OPEN=$?

if [ -z "$1" ]
then
    if [ -z "${HDS_PORT}" ]
    then
        if [ $DEF_OPEN -eq 0 ]
        then
            echo "Default port $DEFAULT_PORT unavailable"
            HDS_PORT=$(python -c 'import socket; s=socket.socket(); s.bind(("", 0)); print(s.getsockname()[1]); s.close()')
        else
            HDS_PORT=$DEFAULT_PORT
        fi
    fi
else
    nc -zv localhost $1 > /dev/null 2>&1
    USR_OPEN=$?
    if [ $USR_OPEN -eq 0 ]
    then
        echo "Port $1 is unavailable"
        if [ $DEF_OPEN -eq 0 ]
            then
                echo "Default port $DEFAULT_PORT is unavailable" && echo "Assigning random port"
                HDS_PORT=$(python -c 'import socket; s=socket.socket(); s.bind(("", 0)); print(s.getsockname()[1]); s.close()')
            else HDS_PORT=$DEFAULT_PORT
        fi
    else
        HDS_PORT=$1
    fi
fi
export HDS_PORT

echo "Create .env file"
echo "HDS_PORT=$HDS_PORT" > .env
echo "  Using port: $HDS_PORT"