locals {
  env                    = "dev"
  db_pwd_id              = "hds_db_pwd"
  db_name                = "hdsdb"
  db_root_user           = "aft"
  errorreport_queue_name = "errorreport-queue"
}

resource "random_password" "hds_rds_pwd" {
  length  = 16
  special = false
}

resource "aws_secretsmanager_secret" "hds_rds_pwd" {
  name = local.db_pwd_id
}

resource "aws_secretsmanager_secret_version" "hds_db_pwd" {
  secret_id     = local.db_pwd_id
  secret_string = random_password.hds_rds_pwd.result
  depends_on = [
    aws_secretsmanager_secret.hds_rds_pwd
  ]
}

module "hds_backend" {
  source                 = "../../module/backend"
  env                    = local.env
  vpc_id                 = data.aws_vpc.infra_vpc.id
  db_subnets             = data.aws_subnet_ids.priv_subnets.ids
  db_root_pwd            = aws_secretsmanager_secret_version.hds_db_pwd.secret_string
  db_name                = local.db_name
  db_root_user           = local.db_root_user
  db_ingress_sg_rules    = []
  errorreport_queue_name = local.errorreport_queue_name
}