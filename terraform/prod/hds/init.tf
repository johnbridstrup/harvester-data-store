terraform {
  backend "s3" {
    profile        = "aft-prod"
    region         = "us-west-1"
    bucket         = "aft-tf-state-us-west-1"
    key            = "us-west-1/hds_ecs.tfstate"
    dynamodb_table = "aft-tf-state-lock-us-west-1"
  }
}

provider "aws" {
  profile = "aft-prod"
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
  name         = "cloud.advanced.farm"
  private_zone = false
}

data "aws_route53_zone" "private_cloud_zone" {
  name         = "cloud.advanced.farm"
  private_zone = true
}

data "aws_secretsmanager_secret_version" "hds_rds_pwd" {
  secret_id = "hds_db_pwd"
}

data "aws_secretsmanager_secret_version" "django_secret_key" {
  secret_id = "hds_django_secret"
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
