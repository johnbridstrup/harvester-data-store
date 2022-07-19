#!/bin/bash

echo "Starting supervisord"
supervisord

echo "" && echo "Migrate"
python ${HDS_ROOT}/manage.py migrate
echo "" && echo "Populate initial data"
python ${HDS_ROOT}/manage.py loaddata fixtures/*

echo "" && echo "Starting server"
python ${HDS_ROOT}/manage.py runserver 0.0.0.0:${HDS_PORT}