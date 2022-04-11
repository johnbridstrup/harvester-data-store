#!/bin/bash

echo "Setting up environment"
source ./setup-venv.sh

echo "Unit tests"
# Test scripts called here

echo "Spinning up dev server"
sudo docker compose -f docker-compose.test.yml up -d --build
sleep 1 # Ensure spin-up before curl

echo "Confirm hosted on localhost:8010"
curl localhost:8010 > /dev/null
res1=$?
if test "$res1" != "0"; then
    echo "curl failed with: $res1"
    exit 1
fi
echo "curl successful"

echo "Tear down"
sudo docker compose down

echo "Spinning up production server"
sudo docker compose -f docker-compose.prod.yml up -d --build
sleep 1

echo "Confirm hosted on localhost:8010"
curl localhost:8010 > /dev/null
res2=$?
if test "$res2" != "0"; then
    echo "curl failed with: $res2"
    exit 1
fi
echo "curl successful"

echo "Tear down"
sudo docker compose down