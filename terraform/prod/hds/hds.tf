locals {
  env                  = "prod"
  dns_name             = "hds.cloud.advanced.farm"
  service_port         = "8000"
  service_name         = "hds"
  service_docker_image = "838860823423.dkr.ecr.us-west-1.amazonaws.com/hds:hds-staging-776de8c"
  environment_variables = [
    { "name" : "POSTGRES_NAME", "value" : data.aws_db_instance.postgres.db_name },
    { "name" : "POSTGRES_PASSWORD", "value" : data.aws_secretsmanager_secret_version.hds_rds_pwd.secret_string },
    { "name" : "POSTGRES_USER", "value" : data.aws_db_instance.postgres.master_username },
    { "name" : "DEBUG", "value" : "true" },
    { "name" : "DJANGO_ALLOWED_HOSTS", "value" : "localhost 127.0.0.1" },
    { "name" : "SQL_ENGINE", "value" : "django.db.backends.postgresql" },
    { "name" : "SQL_PORT", "value" : data.aws_db_instance.postgres.port },
    { "name" : "SQL_HOST", "value" : data.aws_db_instance.postgres.address },
    { "name" : "DJANGO_SECRET_KEY", "value" : data.aws_secretsmanager_secret_version.django_secret_key.secret_string }
  ]

  healthcheck_path = "/api/v1/healthcheck/"
}

data "aws_iam_policy_document" "execute_task" {
  statement {
    actions = [
      "ssmmessages:CreateControlChannel",
      "ssmmessages:CreateDataChannel",
      "ssmmessages:OpenControlChannel",
      "ssmmessages:OpenDataChannel"
    ]
    resources = ["*"]
    effect    = "Allow"
  }
}
module "hds" {
  source                         = "../../module/hds"
  env                            = local.env
  service_dns_name               = local.dns_name
  vpc_id                         = data.aws_vpc.infra_vpc.id
  service_port                   = local.service_port
  service_name                   = local.service_name
  service_docker_image           = local.service_docker_image
  service_subnets                = data.aws_subnet_ids.priv_subnets.ids
  load_balancer_subnets          = data.aws_subnet_ids.priv_subnets.ids
  ecs_cluster_arn                = data.aws_ecs_cluster.hds-cluster.arn
  route53_priv_zone_id           = data.aws_route53_zone.private_cloud_zone.id
  route53_pub_zone_id            = data.aws_route53_zone.cloud_zone.id
  service_environments_variables = local.environment_variables
  service_health_check_path      = local.healthcheck_path
  service_iam_policy_document    = data.aws_iam_policy_document.execute_task.json
  service_alb_ingress_sg_rules = [
    "80,tcp,${data.aws_security_group.lambda_sg.id},web traffic from lambda",
    "443,tcp,${data.aws_security_group.lambda_sg.id},ssl traffic from lambda",
    "80,tcp,${data.aws_security_group.pritunl_sg.id},web traffic from pritunl",
    "443,tcp,${data.aws_security_group.pritunl_sg.id},ssl traffic from pritunl"
  ]
}

resource "aws_security_group_rule" "hds_db_rule" {
  type                     = "ingress"
  from_port                = data.aws_db_instance.postgres.port
  to_port                  = data.aws_db_instance.postgres.port
  protocol                 = "tcp"
  source_security_group_id = module.hds.service_security_group_id
  security_group_id        = data.aws_security_group.hdsdb_sg.id
}
