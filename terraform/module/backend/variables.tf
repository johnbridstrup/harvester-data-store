variable "prefix" {
  description = ""
  type        = string
  default     = ""
}

variable "env" {
  description = "Name of the environment. Resources are tagged with this value."
  type        = string
}

variable "db_name" {
  description = "Postgres database name."
  type        = string
}

variable "db_engine_version" {
  description = "The engine version to use."
  type        = string
  default     = "13.4"
}

variable "db_root_user" {
  description = "Postgres Root username."
  type        = string
}

variable "db_root_pwd" {
  description = "Postgres Root password."
  type        = string

  validation {
    condition     = length(var.db_root_pwd) >= 8
    error_message = "Password must be longer at least 8 characters."
  }
}

variable "vpc_id" {
  description = "The VPC to deploy the DB into."
  type        = string
}

variable "db_subnets" {
  description = "VPC subnets to use for the database."
  type        = list(string)
}

variable "db_storage" {
  description = "The allocated storage for the DB in gibibytes."
  type        = number
  default     = 20

  validation {
    condition     = var.db_storage >= 20
    error_message = "Minimum for gp2 disks is 20GB."
  }
}

variable "db_instance_type" {
  description = "The instance type of the RDS instance."
  type        = string
  default     = "db.t3.micro"
}

variable "db_multi_az" {
  description = "If the RDS instance is multi AZ enabled. Recommended for production usage."
  type        = string
  default     = "false"
}

variable "db_ingress_sg_rules" {
  description = "Ingress rules to add to the DB security group. CSV format: port,proto,sg-id."
  type        = set(string)
  default     = []
}