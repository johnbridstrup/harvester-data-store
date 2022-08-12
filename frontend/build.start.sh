#!/bin/bash

export HDS_ROOT="$( git rev-parse --show-toplevel )"

cd "$HDS_ROOT/frontend"

npm install 

npm run build

node server.js
