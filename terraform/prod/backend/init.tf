terraform {
  backend "s3" {
    profile        = "aft-dev"
    region         = "us-west-1"
    bucket         = "aft-tf-state-us-west-1-dev"
    key            = "us-west-1/hds.tfstate"
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
