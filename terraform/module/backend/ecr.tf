module "hds-ecr-repo" {
  source    = "git@github.com:AdvancedFarm/infrastructure.git//terraform/modules/ecr-repo?ref=master"
  env       = "prod"
  repo_name = "hds"
}