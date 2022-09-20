locals {
  env                  = "dev"
  dns_name             = "hds.devcloud.advanced.farm"
  service_port         = "3000"
  service_name         = "hds-frontend"
  service_docker_image = "082346306812.dkr.ecr.us-west-1.amazonaws.com/hds:hds-frontend-dc6e1c46"
  healthcheck_path     = "/"
}


module "hds-frontend" {
  source                    = "../../module/hds"
  env                       = local.env
  service_dns_name          = local.dns_name
  vpc_id                    = data.aws_vpc.infra_vpc.id
  service_port              = local.service_port
  service_name              = local.service_name
  service_docker_image      = local.service_docker_image
  service_subnets           = data.aws_subnet_ids.priv_subnets.ids
  load_balancer_subnets     = data.aws_subnet_ids.priv_subnets.ids
  ecs_cluster_arn           = data.aws_ecs_cluster.hds-cluster.arn
  route53_priv_zone_id      = data.aws_route53_zone.private_cloud_zone.id
  route53_pub_zone_id       = data.aws_route53_zone.cloud_zone.id
  service_health_check_path = local.healthcheck_path
  service_alb_ingress_sg_rules = [
    "80,tcp,${data.aws_security_group.lambda_sg.id},web traffic from lambda",
    "443,tcp,${data.aws_security_group.lambda_sg.id},ssl traffic from lambda",
    "80,tcp,${data.aws_security_group.pritunl_sg.id},web traffic from pritunl",
    "443,tcp,${data.aws_security_group.pritunl_sg.id},ssl traffic from pritunl"
  ]
}
