#!/bin/bash

echo ""
echo "Setting up environment"
source ./setup-venv.sh

echo ""
echo "Find open port"

source ./scripts/set_port.sh

echo ""
echo "Spinning up test server"
sudo docker compose -f docker-compose.test.yml up -d --build 
sudo docker compose exec web python hds/manage.py makemigrations
sudo docker compose exec web python hds/manage.py migrate
sudo docker compose exec web python hds/manage.py loaddata fixtures/*
sleep 1 # Ensure spin-up before curl

echo ""
echo "Confirm hosted on localhost:${HDS_PORT}"
echo ""
curl localhost:${HDS_PORT} > /dev/null
res1=$?
if test "$res1" != "0"; then
    echo "curl failed with: $res1"
    exit 1
fi
echo "curl successful"

echo ""
echo "Tear down"
sudo docker compose down

echo ""
echo "Spinning up production server"
sudo docker compose -f docker-compose.prod.yml up -d --build 
sleep 1

echo ""
echo "Confirm hosted on localhost:${HDS_PORT}"
echo ""
curl localhost:${HDS_PORT} > /dev/null
res2=$?
if test "$res2" != "0"; then
    echo "curl failed with: $res2"
    exit 1
fi
echo "curl successful"

echo ""
echo "Tear down"
sudo docker compose down