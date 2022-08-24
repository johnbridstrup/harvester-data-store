resource "aws_elasticache_subnet_group" "redis_subnet_group" {
  name       = "redis-subgr"
  subnet_ids = var.db_subnets

  tags = {
    Name        = "hds-redis"
    Environment = var.env
  }
}


resource "aws_security_group" "redis_sg" {
  name_prefix = "hds-redis-sg-"
  description = "db security group"
  vpc_id      = var.vpc_id

  tags = {
    Name        = "hds-redis"
    Environment = var.env
  }
}

resource "aws_elasticache_replication_group" "hds_cache" {
  replication_group_id = "hds-cache"
  description          = "HDS redis cluster"
  node_type            = "cache.t3.micro"
  num_cache_clusters   = 1
  port                 = 6379
  subnet_group_name    = aws_elasticache_subnet_group.redis_subnet_group.name
  security_group_ids   = [aws_security_group.redis_sg.id]

  tags = {
    Name        = "hds-redis"
    Environment = var.env
  }
}

