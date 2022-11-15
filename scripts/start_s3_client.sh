#!/bin/bash

# The two arguments to this script should be
# 1: Endpoint in all caps
# 2: Prometheus port (later, once its in py-packages)

URL=$( printenv "${1}_QUEUE_URL" )

while [ ! -f /opt/app/hds/.sqstoken ]
do
  echo "Waiting for SQS token"
  sleep 2
done

source /opt/app/hds/.sqstoken

HEADERS="{\"Accept\":\"application/json\",\"Authorization\":\"Token ${SQS_TOKEN}\"}"
DEST="http://localhost:${HDS_PORT}/api/v1/${1,,}/"
echo "QUEUE URL ${URL}"
echo "DESTINATION ${DEST}"

echo "CALL sqs_client --queue $URL --destination $DEST --delete --s3-delete --s3-event-payload --headers $HEADERS"

sqs_client --queue $URL --destination $DEST --delete --s3-delete --s3-event-payload --headers "$HEADERS" --prom-port ${2}