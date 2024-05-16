set -eo pipefail

pushd terraform/prod/hds

terraform apply apply.tfplan
