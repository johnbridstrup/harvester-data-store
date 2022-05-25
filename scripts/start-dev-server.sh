#!/bin/bash

cd $HDS_ROOT
echo "" && echo "Build"
docker compose up -d --build
echo "" && echo "Migrate"
docker compose exec web python hds/manage.py makemigrations && \
docker compose exec web python hds/manage.py migrate
echo "" && echo "Populate initial data"
docker compose exec web python hds/manage.py loaddata fixtures/*
