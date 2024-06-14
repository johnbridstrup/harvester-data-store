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
if ! npm install; then
    echo "Failed to install Newman"
    exit 1
fi

echo ""
echo "Check Newman version"
npm run version

echo ""
echo "Running Newman tests"
npm run newman

echo "Newman runner test passed successfully"
