#!/bin/bash

# Start sqs client from sqs.yml config

# Wait for sqs API token to generate
while [ ! -f /opt/app/hds/.sqstoken ]
do
  echo "Waiting for SQS token"
  sleep 2
done

source /opt/app/hds/.sqstoken

HEADERS="{\"Accept\":\"application/json\",\"Authorization\":\"Token ${SQS_TOKEN}\"}"
YAML="/opt/app/sqs.yml"

echo "Starting SQS Client"

sqs_client --delete --headers "$HEADERS" from-yaml --yml ${YAML}