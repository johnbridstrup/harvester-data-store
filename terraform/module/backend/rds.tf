locals {
  db_pwd_id              = "hds_rds_pwd"
}
resource "random_password" "hds_rds_pwd" {
  length  = 16
  special = false
}

resource "aws_secretsmanager_secret" "hds_rds_pwd" {
  name = local.db_pwd_id
}

resource "aws_secretsmanager_secret_version" "hds_rds_pwd" {
  secret_id     = local.db_pwd_id
  secret_string = random_password.hds_rds_pwd.result
  depends_on = [
    aws_secretsmanager_secret.hds_rds_pwd
  ]
}

module "hds-rds" {
  source              = "git@github.com:AdvancedFarm/infrastructure.git//terraform/modules/postgresql?ref=master"
  vpc_id              = var.vpc_id
  env                 = var.env
  db_root_pwd         = aws_secretsmanager_secret_version.hds_rds_pwd.secret_string
  db_root_user        = var.db_root_user
  db_name             = var.db_name
  db_engine_version   = var.db_engine_version
  db_subnets          = var.db_subnets
  db_storage          = var.db_storage
  db_instance_type    = var.db_instance_type
  db_multi_az         = var.db_multi_az
  db_ingress_sg_rules = var.db_ingress_sg_rules
}