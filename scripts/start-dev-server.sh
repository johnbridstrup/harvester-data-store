#!/bin/bash

cd $HDS_ROOT
echo "" && echo "Build"
docker compose up -d --build

echo "" && echo "Load Fixtures"
sleep 10
docker compose exec web python hds/manage.py loaddata fixtures/*
