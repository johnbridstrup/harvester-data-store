terraform {
  backend "s3" {
    profile        = "aft-dev"
    region         = "us-west-1"
    bucket         = "aft-tf-state-us-west-1-dev"
    key            = "us-west-1/hds_frontend.tfstate"
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

data "aws_subnets" "priv_subnets" {
  filter {
    name   = "vpc-id"
    values = [data.aws_vpc.infra_vpc.id]
  }

  tags = {
    Type = "private"
  }
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

data "aws_security_group" "pritunl_sg" {
  tags = {
    Name = "pritunl-vpn"
  }
}
