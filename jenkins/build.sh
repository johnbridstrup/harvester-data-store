set -eo pipefail

# Install necessary packages
sudo apt update -y; sudo apt install build-essential awscli -y

# Build
pushd make/prod
make jenkins