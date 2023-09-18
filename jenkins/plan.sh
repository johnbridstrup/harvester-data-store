set -eo pipefail

# Install Terraform
./scripts/install-terraform.sh

pushd terraform/prod/hds

if [ -n "$_AFT_DEPLOY_TAG"]; then
    export TF_VAR_deploy_tag=$(git rev-parse --short HEAD)
else
    export TF_VAR_deploy_tag=$_AFT_DEPLOY_TAG
fi

terraform init -upgrade
terraform plan -var="migrate_flag=false" -out apply.tfplan
