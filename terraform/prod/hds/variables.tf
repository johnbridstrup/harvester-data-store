variable "migrate_flag" {
  description = "Migrate on deployment (true/false)"
  type        = string
}

variable "git_hash" {
  description = "Git hash being deployed"
  type        = string
}

variable "deploy_tag" {}