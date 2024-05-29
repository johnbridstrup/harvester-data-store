#!/bin/bash

set -euo pipefail

INSTALL_NODE_VER=20.11.1
INSTALL_NVM_VER=0.39.7

sudo apt update
sudo apt install -y curl

echo "==> Ensuring .bashrc exists and is writable"
touch ~/.bashrc

echo "==> Installing Node Version Manager (NVM). Version $INSTALL_NVM_VER"
rm -rf ~/.nvm

curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v$INSTALL_NVM_VER/install.sh | bash

# To use it, you must first source your .bashrc file
source ~/.bashrc

# Make nvm command available to terminal
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh" # This loads nvm
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"  # This loads nvm bash_completion

echo "==> Installing Node.js version $INSTALL_NODE_VER"
nvm install $INSTALL_NODE_VER

echo "==> Setting Node.js version $INSTALL_NODE_VER as default"
nvm use $INSTALL_NODE_VER

echo "==> Checking for versions"
nvm --version
node --version
npm --version

echo "==> Print binary paths"
which npm
which node

echo "==> List installed Node.js versions"
nvm ls

echo "==> Now you're all setup and ready for development."
