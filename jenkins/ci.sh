#!/bin/bash

echo "Setting up environment"
source ./setup-venv.sh
HDS_PORT=8085
touch .env
echo "HDS_PORT=$HDS_PORT" > .env

echo "Unit tests"
# Test scripts called here

echo "Spinning up test server"
sudo docker compose -f docker-compose.test.yml up -d --build 
sudo docker compose exec web python hds/manage.py makemigrations
sudo docker compose exec web python hds/manage.py migrate
sudo docker compose exec web python hds/manage.py loaddata fixtures/*
sleep 1 # Ensure spin-up before curl

echo "Confirm hosted on localhost:${HDS_PORT}"
curl localhost:${HDS_PORT} > /dev/null
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

echo "Confirm hosted on localhost:${HDS_PORT}"
curl localhost:${HDS_PORT} > /dev/null
res2=$?
if test "$res2" != "0"; then
    echo "curl failed with: $res2"
    exit 1
fi
echo "curl successful"

echo "Tear down"
sudo docker compose down