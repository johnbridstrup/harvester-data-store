resource "aws_ecs_cluster" "hds-cluster" {
  name = "hds-cluster"

  setting {
    name  = "containerInsights"
    value = "enabled"
  }
}