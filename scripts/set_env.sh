#!/bin/bash

# Create the .env file

set -euo pipefail

: "${HDS_PORT:=8085}"
: "${JOB_SERVER_ADDRESS:=http://httpbin.org/anything}"

echo "Create .env file"
echo "HDS_PORT=$HDS_PORT" > .env
echo "JOB_SERVER_ADDRESS=$JOB_SERVER_ADDRESS" >> .env
echo "  Using port: $HDS_PORT"
echo "  Jobserver address: $JOB_SERVER_ADDRESS"
