#!/bin/bash
# Set the port used by HDS

if [ -z $(sudo docker compose ps -q web) ] || [ -z $(sudo docker ps -q --no-trunc | grep $(sudo docker compose ps -q web)) ]; then
    echo "Setting port"
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
                    echo "Assigning random port"
                    HDS_PORT=$(python -c 'import socket; s=socket.socket(); s.bind(("", 0)); print(s.getsockname()[1]); s.close()')
                else HDS_PORT=$DEFAULT_PORT
            fi
        else
            HDS_PORT=$1
        fi
    fi
else
    p=`sudo docker port hds-web-1`
    HDS_PORT=${p%%/*}
    echo "HDS already running on ${HDS_PORT}"
fi

export HDS_PORT
$HDS_ROOT/scripts/set_env.sh
