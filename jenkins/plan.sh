set -eo pipefail

# Install Terraform
./scripts/install-terraform.sh
SHA=$(git rev-parse --short HEAD)

pushd terraform/prod/hds

if [ -n "$_AFT_DEPLOY_TAG"]; then
    export TF_VAR_deploy_tag=$SHA
else
    export TF_VAR_deploy_tag=$_AFT_DEPLOY_TAG
fi

terraform init -upgrade
terraform plan -var="migrate_flag=false" -var="git_hash=$SHA" -out apply.tfplan
