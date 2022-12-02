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
  default     = "8000"
  type        = string
}

variable "enable_prometheus_scrape" {
  description = "Enable scraping /metrics at the service port"
  type        = bool
  default     = false
}

variable "additional_prometheus_ports" {
  description = "Additional prometheus ports to scrape, by default only service_port get scraped."
  type        = list(number)
  default     = []
}

# ENVIRONMENT VARIABLES

variable "db_name" {
  description = "Name of the database"
  type        = string
}

variable "db_pwd" {
  description = "Database password"
  type        = string
}

variable "db_user" {
  description = "Database username"
  type        = string
}

variable "db_port" {
  description = "Databse port"
  type        = string
}

variable "db_host" {
  description = "Database host address"
  type        = string
}

variable "django_debug" {
  description = "Django debug mode"
  default     = "true"
  type        = string
}

variable "django_db_backend" {
  description = "Django database backend"
  default     = "django_prometheus.db.backends.postgresql"
  type        = string
}

variable "django_superuser_pwd" {
  description = "Django superuser password"
  type        = string
}

variable "sqs_user_pwd" {
  description = "SQS user password"
  type        = string
}

variable "s3_download" {
  description = "Enable download files from S3"
  type        = string
  default     = "true"
}

variable "page_caching" {
  description = "Enable page caching"
  type        = string
  default     = "true"
}

variable "redis_broker_url" {
  description = "URL of redis cache"
  type        = string
}

variable "slack_token" {
  description = "Slack API token"
  type        = string
}

variable "frontend_url" {
  description = "URL for frontend app"
  type        = string
}

variable "migrate_flag" {
  description = "Flag to migrate the database on deployment"
  type        = string
  default     = "false"
}

# SQS QUEUES

variable "errorreport_queue_url" {
  description = "URL for error report queue"
  type        = string
}

variable "s3files_queue_url" {
  description = "URL for hdsfiles queue"
  type        = string
}

variable "sessclip_queue_url" {
  description = "URL for sessclip queue"
  type        = string
}

variable "versions_queue_url" {
  description = "URL for versions queue"
  type        = string
}

variable "jobresults_queue_url" {
  description = "URL for jobresults queue"
  type        = string
}