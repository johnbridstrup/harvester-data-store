#!/bin/bash

CONF=${MONITOR_CONF:-"/etc/supervisor/conf.d/supervisord.conf"}
LOGLEVEL=${MONITOR_LOG_LEVEL:-"INFO"}
PORT=${MONITOR_PORT:-9151}
SCRIPTDIR=$(dirname "$(realpath "$0")")

cd $SCRIPTDIR
./monitor.service --config $CONF --log-level $LOGLEVEL --port $PORT --wait-time 15
