module "git_info" {
  source = "Invicton-Labs/git-info/external"

  // The directory to check
  working_dir = "../"

  // Whether to fetch from the remote prior to getting the other data
  fetch = false

  // Whether to pull from the remote
  pull = false

  // None of these are required because they all default to `true` anyways,
  // but this shows the options
  get_commit_hash     = true
  get_current_branch  = false
  get_current_tags    = false
  get_local_branches  = false
  get_remote_branches = false
  get_remotes         = false
  get_tags            = false
}

locals {
  environment_variables = [
    { "name" : "POSTGRES_NAME", "value" : var.db_name },
    { "name" : "POSTGRES_PASSWORD", "value" : var.db_pwd },
    { "name" : "POSTGRES_USER", "value" : var.db_user },
    { "name" : "DEBUG", "value" : var.django_debug },
    { "name" : "DJANGO_ALLOWED_HOSTS", "value" : "localhost 127.0.0.1" },
    { "name" : "SQL_ENGINE", "value" : var.django_db_backend },
    { "name" : "SQL_PORT", "value" : var.db_port },
    { "name" : "SQL_HOST", "value" : var.db_host },
    { "name" : "DJANGO_SUPERUSER_PASSWORD", "value" : var.django_superuser_pwd },
    { "name" : "DJANGO_SUPERUSER_USERNAME", "value" : "aft" },
    { "name" : "DJANGO_SUPERUSER_EMAIL", "value" : "john@advanced.farm" },
    { "name" : "SQS_USER_PASSWORD", "value" : var.sqs_user_pwd },
    { "name" : "HDS_PORT", "value" : var.service_port },
    { "name" : "PAGE_CACHING", "value" : var.page_caching },
    { "name" : "BROKER_URL", "value" : var.redis_broker_url },
    { "name" : "SLACK_TOKEN", "value" : var.slack_token },
    { "name" : "FRONTEND_URL", "value" : var.frontend_url },
    { "name" : "ERRORREPORTS_QUEUE_URL", "value" : var.errorreport_queue_url },
    { "name" : "AUTODIAGNOSTICS_QUEUE_URL", "value" : var.autodiagnostics_queue_url },
    { "name" : "S3FILES_QUEUE_URL", "value" : var.s3files_queue_url },
    { "name" : "SESSCLIP_QUEUE_URL", "value" : var.sessclip_queue_url },
    { "name" : "HARVVERSION_QUEUE_URL", "value" : var.versions_queue_url },
    { "name" : "JOBRESULTS_QUEUE_URL", "value" : var.jobresults_queue_url },
    { "name" : "MIGRATE", "value" : var.migrate_flag },
    { "name" : "GITHASH", "value" : module.git_info.commit_hash },
    { "name" : "AWS_STORAGE_BUCKET_NAME", "value": var.s3_bucket },
    { "name" : "HDS_API_ROOT", "value" : var.service_dns_name },
    { "name" : "USES3", "value" : "true" },
  ]
}

module "hds_ecs" {
  source                         = "git@github.com:AdvancedFarm/infrastructure.git//terraform/modules/ecs-service?ref=master"
  env                            = var.env
  service_dns_name               = var.service_dns_name
  service_name                   = var.service_name
  service_subnets                = var.service_subnets
  load_balancer_subnets          = var.load_balancer_subnets
  service_port                   = var.service_port
  vpc_id                         = var.vpc_id
  ecs_cluster_arn                = var.ecs_cluster_arn
  enable_prometheus_scrape       = var.enable_prometheus_scrape
  additional_prometheus_ports    = var.additional_prometheus_ports
  service_docker_image           = var.service_docker_image
  service_health_check_path      = var.service_health_check_path
  service_environments_variables = local.environment_variables
  route53_priv_zone_id           = var.route53_priv_zone_id
  route53_pub_zone_id            = var.route53_pub_zone_id
  service_iam_policy_document    = var.service_iam_policy_document
  service_alb_ingress_sg_rules   = var.service_alb_ingress_sg_rules
  service_ingress_sg_rules       = var.service_ingress_sg_rules
  service_container_memory       = var.service_container_memory
  service_container_cpu          = var.service_container_cpu
}

output "git_info" {
  value = module.git_info
}