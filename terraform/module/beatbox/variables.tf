variable "service_name" {
  description = "Name of the service."
  type        = string
}

variable "service_dns_name" {
  description = "DNS Name of the service."
  type        = string
}

variable "env" {
  description = "Name of the environment. Resources are tagged with this value."
  type        = string
}

variable "service_subnets" {
  description = "A list of private subnet ID's to deploy the ECS container(s) to."
  type        = list(string)
}

variable "load_balancer_subnets" {
  description = "A list of public/private subnet ID's to deploy the ECS container(s) to."
  type        = list(string)
  default     = [""]
}

variable "ecs_cluster_arn" {
  description = "ECS cluster arn to use to deploy the container(s) to."
  type        = string
}

variable "vpc_id" {
  description = "The VPC to deploy the service into."
  type        = string
}

variable "create_lb" {
  description = "Create LB for the service."
  type        = bool
  default     = true
}

variable "internal_lb" {
  description = "Create an internal LB."
  type        = bool
  default     = true
}

variable "route53_priv_zone_id" {
  description = "Route53 zone ID."
  type        = string
  default     = ""
}

variable "route53_pub_zone_id" {
  description = "Route53 pub zone ID."
  type        = string
  default     = ""
}

variable "logging_retention_in_days" {
  description = "CloudWatch logs retention."
  type        = string
  default     = "7"
}

variable "service_health_check_path" {
  description = "Path to use for health check."
  type        = string
  default     = ""
}

variable "service_health_check_matcher" {
  description = "CSV string of response codes allowed in health check."
  type        = string
  default     = ""
}

variable "service_iam_policy_document" {
  description = "IAM policy document to attach to the service in JSON format."
  type        = any
  default     = ""
}

variable "service_docker_image" {
  description = "Docker image to use."
  type        = string
  default     = ""
}

variable "service_container_cpu" {
  description = "Amount of container shares to reserve for the service container."
  type        = string
  default     = "256"
}

variable "service_container_memory" {
  description = "Amount of memory in MB to reserve for the service container."
  type        = string
  default     = "512"
}

variable "service_container_instance_count" {
  description = "Number of container instances to run."
  type        = string
  default     = "1"
}

variable "service_environments_variables" {
  description = "The environment variables to pass to the service container."
  type        = list(map(string))
  default     = []
}

variable "service_ingress_cidr_rules" {
  description = "Ingress rules to add to the service security group. CSV format: port,proto,cidr."
  type        = set(string)
  default     = []
}

variable "service_ingress_sg_rules" {
  description = "Ingress rules to add to the service security group. CSV format: port,proto,sg-id."
  type        = set(string)
  default     = []
}

variable "service_alb_ingress_cidr_rules" {
  description = "Ingress rules to add to the service ALB security group. CSV format: port,proto,cidr."
  type        = set(string)
  default     = []
}

variable "service_alb_ingress_sg_rules" {
  description = "Ingress rules to add to the service ALB security group. CSV format: port,proto,sg-id."
  type        = set(string)
  default     = []
}

variable "service_cmd_options" {
  description = "Docker container cmd options."
  type        = list(string)
  default     = []
}

variable "service_entrypoint" {
  description = "Docker entrypoint to use."
  type        = string
  default     = ""
}

variable "service_port" {
  description = "Port of the service to use for forward traffic to."
  type        = string
}

# Beatbox specfici

variable "target_host_url" {
  description = "URL of service to test."
  type        = string
}

variable "slack_token" {
  description = "Slack token to send messages."
  type        = string
}

variable "slack_channel" {
  description = "Channel to send failure messages to."
  type        = string
}

variable "beatbox_pwd" {
  description = "Password for beatbox user."
  type        = string
}

variable "server_address" {
  description = "Address at which the server is hosted."
  type        = string
}

variable "verbose_logging" {
  description = "Enable verbose logging from beatbox"
  type        = string
  default     = "false"
}

variable "beat_interval" {
  description = "Time in seconds between test executions."
  type        = number
  default     = 30
}

variable "bucket_name" {
  description = "Name of the bucket for uploading files"
  type        = string
}

variable "run_tests_async" {
  description = "Run tests in parallel with pytest-xdist"
  type        = string
  default     = "false"
}