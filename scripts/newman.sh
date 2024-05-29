#!/bin/bash

set -euo pipefail

echo ""
echo "Using Node Version"
if ! command -v node &> /dev/null; then
    echo "Node.js is not installed. Please install Node.js."
    exit 1
fi
if ! command -v npm &> /dev/null; then
    echo "npm is not installed. Please install npm."
    exit 1
fi
node -v
npm -v
echo ""

echo "Installing Newman"
if ! npm install -g newman; then
    echo "Failed to install Newman"
    exit 1
fi
if ! command -v newman &> /dev/null; then
    echo "Newman installation failed"
    exit 1
fi
newman -v
echo ""

echo "Running Newman tests"
newman run -e postman/hds.local.postman_environment.json --bail --delay-request 1000 postman/hds.postman_collection.json

res1=$?
if test "$res1" != "0"; then
    echo "Newman runner test failed with: $res1"
    exit 1
fi

echo "Newman runner test passed successfully"
