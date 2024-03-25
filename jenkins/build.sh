set -eo pipefail

# Build
make build-monitor
pushd make/prod
make jenkins
