#!/bin/bash
# Set the jobserver address env variable

DEFAULT_ADDRESS="http://httpbin.org/anything"
REAL_ADDRESS="http://iot-job-server.cloud.advanced.farm:8000"

if [ -z "${1:-}" ]; then
    export JOB_SERVER_ADDRESS=$DEFAULT_ADDRESS
elif [ "${1:-}" = "prod" ]; then
    export JOB_SERVER_ADDRESS=$REAL_ADDRESS
else
    export JOB_SERVER_ADDRESS=$1
fi

echo ""
echo "JOB_SERVER_ADDRESS set to $JOB_SERVER_ADDRESS"
