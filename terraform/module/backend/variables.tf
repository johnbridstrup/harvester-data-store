# General
variable "prefix" {
  description = ""
  type        = string
  default     = ""
}

variable "env" {
  description = "Name of the environment. Resources are tagged with this value."
  type        = string
}

# https://github.com/AdvancedFarm/infrastructure/tree/master/terraform/modules/postgresql/variables.tf
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

# https://github.com/AdvancedFarm/infrastructure/tree/master/terraform/modules/sqs-queue/variables.tf
variable "errorreport_queue_name" {
  description = "SQS queue name."
  type        = string
}

variable "fifo_queue" {
  description = "Create a FIFO queue. FIFO queue do not work with S3 notifications."
  type        = bool
  default     = false
}

variable "content_based_deduplication" {
  description = "Enables content-based deduplication for FIFO queues."
  type        = bool
  default     = false
}

variable "create_dlq" {
  description = "create an additional queue and use it as dead letter queue (dlq). The dlq will store all the messages the the worker(s) will not be able to process and delete after max_receive_count."
  type        = bool
  default     = true
}

variable "delay_seconds" {
  description = "The time in seconds that the delivery of all messages in the queue will be delayed. An integer from 0 to 900 (15 minutes). The default for this attribute is 0 seconds."
  type        = number
  default     = 0
}

variable "max_message_size" {
  description = "The limit of how many bytes a message can contain before Amazon SQS rejects it. An integer from 1024 bytes (1 KiB) up to 262144 bytes (256 KiB). The default for this attribute is 262144 (256 KiB)."
  type        = number
  default     = 262144
}

variable "message_retention_seconds" {
  description = "The number of seconds Amazon SQS retains a message. Integer representing seconds, from 60 (1 minute) to 1209600 (14 days). The default for this attribute is 345600 (4 days)."
  type        = number
  default     = 345600
}

variable "receive_wait_time_seconds" {
  description = "The time for which a ReceiveMessage call will wait for a message to arrive (long polling) before returning. An integer from 0 to 20 (seconds). The default for this attribute is 10."
  type        = number
  default     = 10
}

variable "max_receive_count" {
  description = "The number of times a message is delivered to the source queue before being moved to the dead-letter queue. When the ReceiveCount for a message exceeds the maxReceiveCount for a queue, Amazon SQS moves the message to the dead-letter-queue."
  type        = number
  default     = 5
} 