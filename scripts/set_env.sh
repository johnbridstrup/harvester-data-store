#!/bin/bash

# Create the .env file

echo "Create .env file"
echo "HDS_PORT=$HDS_PORT" > .env
echo "JOB_SERVER_ADDRESS=$JOB_SERVER_ADDRESS" >> .env
echo "  Using port: $HDS_PORT"
echo "  Jobserver address: $JOB_SERVER_ADDRESS"
