#!/bin/bash

cd $HDS_ROOT
echo "" && echo "Build"
docker compose up -d --build
