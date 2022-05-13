module "hds-rds" {
  source              = "git@github.com:AdvancedFarm/infrastructure.git//terraform/modules/postgresql?ref=master"
  vpc_id              = var.vpc_id
  env                 = var.env
  db_root_pwd         = var.db_root_pwd
  db_root_user        = var.db_root_user
  db_name             = var.db_name
  db_engine_version   = var.db_engine_version
  db_subnets          = var.db_subnets
  db_storage          = var.db_storage
  db_instance_type    = var.db_instance_type
  db_multi_az         = var.db_multi_az
  db_ingress_sg_rules = var.db_ingress_sg_rules
}