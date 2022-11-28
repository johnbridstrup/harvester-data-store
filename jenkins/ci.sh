#!/bin/bash
echo ""
echo "Setting up environment"
export HDS_ROOT=$PWD
source ./setup-venv.sh

echo ""
echo "Find open port"

source ./scripts/set_port.sh 

echo ""
echo "Spinning up test server"
sudo docker compose -f docker-compose.test.yml up -d --build 
sleep 10 # Ensure spin-up before curl

echo ""
echo "Confirm hosted on localhost:${HDS_PORT}"
echo ""
curl localhost:${HDS_PORT} > /dev/null
res1=$?
if test "$res1" != "0"; then
    echo "curl failed with: $res1"
    sudo docker compose down
    exit 1
fi
echo "curl successful"

echo ""
echo "Tear down"
sudo docker compose down
