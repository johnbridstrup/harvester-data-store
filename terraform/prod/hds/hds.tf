locals {
  env                      = "prod"
  django_debug             = "true"
  dns_name                 = "hdsapi.cloud.advanced.farm"
  frontend_url             = "https://hds.cloud.advanced.farm"
  service_port             = "8000"
  service_name             = "hds"
  service_docker_image     = "838860823423.dkr.ecr.us-west-1.amazonaws.com/hds:hds-staging-7a2b3bf"
  healthcheck_path         = "/api/v1/healthcheck/"
  silk_profiling           = "false"
  silk_cprofile            = "false"
  sqs_client_metrics_ports = [9104]
  enable_prometheus_scrape = true
  service_container_memory = 8192
  service_container_cpu    = 4096
  migrate                  = var.migrate_flag
  s3_bucket                = local.bucket
  jobserver_port           = "8000"
}

resource "random_password" "sqs_pwd" {
  length  = 16
  special = false
}

module "hds" {
  source                      = "../../module/hds"
  env                         = local.env
  service_dns_name            = local.dns_name
  vpc_id                      = data.aws_vpc.infra_vpc.id
  service_port                = local.service_port
  service_name                = local.service_name
  service_docker_image        = local.service_docker_image
  service_subnets             = data.aws_subnets.priv_subnets.ids
  load_balancer_subnets       = data.aws_subnets.priv_subnets.ids
  ecs_cluster_arn             = data.aws_ecs_cluster.hds-cluster.arn
  enable_prometheus_scrape    = local.enable_prometheus_scrape
  additional_prometheus_ports = local.sqs_client_metrics_ports
  route53_priv_zone_id        = data.aws_route53_zone.private_cloud_zone.id
  route53_pub_zone_id         = data.aws_route53_zone.cloud_zone.id
  service_health_check_path   = local.healthcheck_path
  service_iam_policy_document = data.aws_iam_policy_document.poll_queues.json
  service_alb_ingress_sg_rules = [
    "80,tcp,${data.aws_security_group.pritunl_sg.id},web traffic from pritunl",
    "443,tcp,${data.aws_security_group.pritunl_sg.id},ssl traffic from pritunl",
    "80,tcp,${data.aws_security_group.beatbox_sg.id},web traffic from beatbox",
    "443,tcp,${data.aws_security_group.beatbox_sg.id},ssl traffic from beatbox"
  ]
  service_ingress_sg_rules = concat(
    ["${local.service_port},tcp,${data.aws_security_group.vm_metrics_security_group.id},django prometheus scraping"],
    [for port in local.sqs_client_metrics_ports : "${port},tcp,${data.aws_security_group.vm_metrics_security_group.id},sqs client prometheus scraping"]
  )
  service_container_cpu     = local.service_container_cpu
  service_container_memory  = local.service_container_memory
  db_name                   = data.aws_db_instance.postgres.db_name
  db_pwd                    = jsondecode(data.aws_secretsmanager_secret_version.service_secrets.secret_string)["db_root_pwd"]
  db_user                   = jsondecode(data.aws_secretsmanager_secret_version.service_secrets.secret_string)["db_root_user"]
  db_port                   = data.aws_db_instance.postgres.port
  db_host                   = data.aws_db_instance.postgres.address
  django_debug              = local.django_debug
  django_superuser_pwd      = jsondecode(data.aws_secretsmanager_secret_version.service_secrets.secret_string)["hds_superuser_pwd"]
  sqs_user_pwd              = random_password.sqs_pwd.result
  redis_broker_url          = "redis://${data.aws_elasticache_replication_group.hds_cache.primary_endpoint_address}:6379"
  slack_token               = jsondecode(data.aws_secretsmanager_secret_version.service_secrets.secret_string)["slack_token"]
  frontend_url              = local.frontend_url
  errorreport_queue_url     = data.aws_sqs_queue.errorreport_queue.url
  autodiagnostics_queue_url = data.aws_sqs_queue.autodiagnostics_queue.url
  sessclip_queue_url        = data.aws_sqs_queue.sessclip_queue.url
  s3files_queue_url         = data.aws_sqs_queue.file_queue.url
  versions_queue_url        = data.aws_sqs_queue.versions_queue.url
  jobresults_queue_url      = data.aws_sqs_queue.jobresults_queue.url
  config_queue_url          = data.aws_sqs_queue.configs_queue.url
  grip_queue_url            = data.aws_sqs_queue.grip_queue.url
  asset_queue_url           = data.aws_sqs_queue.asset_queue.url
  emustats_queue_url        = data.aws_sqs_queue.emustats_queue.url
  migrate_flag              = local.migrate
  s3_bucket                 = local.bucket
  silk_profiling            = local.silk_profiling
  silk_cprofile             = local.silk_cprofile
}
