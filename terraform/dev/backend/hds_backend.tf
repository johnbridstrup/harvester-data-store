locals {
  env                    = "dev"
  db_name                = "hdsdb"
  db_root_user           = "aft"
  errorreport_queue_name = "errorreport-queue"
}

module "hds_backend" {
  source                 = "../../module/backend"
  env                    = local.env
  vpc_id                 = data.aws_vpc.infra_vpc.id
  db_subnets             = data.aws_subnet_ids.priv_subnets.ids
  db_name                = local.db_name
  db_root_user           = local.db_root_user
  db_ingress_sg_rules    = []
  errorreport_queue_name = local.errorreport_queue_name
}