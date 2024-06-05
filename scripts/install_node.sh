#!/bin/bash

# set -euo pipefail

INSTALL_NVM_VER=0.39.7


# Function to install NVM
install_nvm() {
  echo "==> Installing Node Version Manager (NVM). Version $INSTALL_NVM_VER"

  curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v$INSTALL_NVM_VER/install.sh | bash

  # Make nvm command available to terminal
  export NVM_DIR="$HOME/.nvm"
  [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh" # This loads nvm
  [ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"

  check_and_install_node
}

# Function to check and install Node.js based on .nvmrc or default version
check_and_install_node() {
  nvmrc_node_ver=$(<.nvmrc)
  echo "==> Installing Node.js version $nvmrc_node_ver"
  nvm install
  echo "==> Setting Node.js version $nvmrc_node_ver as default"
  nvm use
}

# Function to check if nvm is installed
check_nvm() {
  # Try and load nvm for this script otherwise we don't always
  # get nvm even though it is installed
  NVM_DIR=${NVM_DIR:-~/.nvm}
  echo "$NVM_DIR/nvm.sh"
  echo "$NVM_DIR/bash_completion"
  source $NVM_DIR/nvm.sh || { echo "This file cannot be source, it doesn't exist"; }
  if command -v nvm &> /dev/null; then
    echo "==> NVM is already installed. Checking for .nvmrc file."
    check_and_install_node
  else
    echo "==> NVM is not installed. Installing NVM and Node.js."
    install_nvm
  fi
}

sudo apt update
sudo apt install -y curl

# Check if nvm is installed and proceed accordingly
check_nvm

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
