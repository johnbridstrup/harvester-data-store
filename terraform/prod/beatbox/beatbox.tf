locals {
  env                  = "prod"
  dns_name             = "beatbox.cloud.advanced.farm"
  protocol             = "https"
  target_url           = "https://hdsapi.cloud.advanced.farm"
  service_port         = "8080"
  service_name         = "hds-beatbox"
  service_docker_image = "082346306812.dkr.ecr.us-west-1.amazonaws.com/hds:hds-beatbox-7c425130"
  healthcheck_path     = "/metrics"
  slack_channel        = "hds-test"
  slack_token          = jsondecode(data.aws_secretsmanager_secret_version.service_secrets.secret_string)["slack_token"]
  beatbox_pwd          = jsondecode(data.aws_secretsmanager_secret_version.service_secrets.secret_string)["beatbox_pwd"]
  beat_interval        = 60
}


module "hds-beatbox" {
  source                    = "../../module/beatbox"
  env                       = local.env
  service_dns_name          = local.dns_name
  vpc_id                    = data.aws_vpc.infra_vpc.id
  service_port              = local.service_port
  service_name              = local.service_name
  service_docker_image      = local.service_docker_image
  service_subnets           = data.aws_subnets.priv_subnets.ids
  load_balancer_subnets     = data.aws_subnets.priv_subnets.ids
  ecs_cluster_arn           = data.aws_ecs_cluster.hds-cluster.arn
  route53_priv_zone_id      = data.aws_route53_zone.private_cloud_zone.id
  route53_pub_zone_id       = data.aws_route53_zone.cloud_zone.id
  service_health_check_path = local.healthcheck_path
  service_iam_policy_document = data.aws_iam_policy_document.s3.json
  slack_token               = local.slack_token
  slack_channel             = local.slack_channel
  target_host_url           = local.target_url
  beatbox_pwd               = local.beatbox_pwd
  beat_interval             = local.beat_interval
  bucket_name = local.bucket
  verbose_logging           = "true"
  server_address            = "${local.protocol}://${local.dns_name}"
  service_alb_ingress_sg_rules = [
    "80,tcp,${data.aws_security_group.pritunl_sg.id},web traffic from pritunl",
    "443,tcp,${data.aws_security_group.pritunl_sg.id},ssl traffic from pritunl"
  ]
}

output "target_url" {
  value = "${local.protocol}://${local.dns_name}"
}