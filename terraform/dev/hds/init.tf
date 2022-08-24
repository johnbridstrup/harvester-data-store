terraform {
  backend "s3" {
    profile        = "aft-dev"
    region         = "us-west-1"
    bucket         = "aft-tf-state-us-west-1-dev"
    key            = "us-west-1/hds_ecs.tfstate"
    dynamodb_table = "aft-tf-state-lock-us-west-1"
  }
}

provider "aws" {
  profile = "aft-dev"
  region  = "us-west-1"
}

data "aws_vpc" "infra_vpc" {
  filter {
    name   = "tag:Name"
    values = ["infra-vpc"]
  }
}

data "aws_subnet_ids" "priv_subnets" {
  vpc_id = data.aws_vpc.infra_vpc.id

  tags = {
    Type = "private"
  }
}

data "aws_db_instance" "postgres" {
  db_instance_identifier = "hdsdb"
}

data "aws_ecs_cluster" "hds-cluster" {
  cluster_name = "hds-cluster"
}

data "aws_route53_zone" "cloud_zone" {
  name         = "devcloud.advanced.farm"
  private_zone = false
}

data "aws_route53_zone" "private_cloud_zone" {
  name         = "devcloud.advanced.farm"
  private_zone = true
}

data "aws_secretsmanager_secret_version" "hds_rds_pwd" {
  secret_id = "hds_rds_pwd"
}

data "aws_secretsmanager_secret_version" "slack_token" {
  secret_id = "dev_slack_token"
}

data "aws_security_group" "lambda_sg" {
  tags = {
    Name = "errorreport"
  }
}

data "aws_security_group" "hdsdb_sg" {
  tags = {
    Name = "hdsdb"
  }
}

data "aws_security_group" "pritunl_sg" {
  tags = {
    Name = "pritunl-vpn"
  }
}
data "aws_security_group" "prom_scrape_sg" {
  tags = {
    Name = "ecs-prometheus-scraper"
  }
}

data "aws_elasticache_replication_group" "hds_cache" {
  replication_group_id = "hds-cache"
}

data "aws_security_group" "redis_sg" {
  tags = {
    Name = "hds-redis"
  }
}