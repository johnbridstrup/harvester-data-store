module "hds_sqs_queue" {
  for_each                    = var.queue_names
  source                      = "git@github.com:AdvancedFarm/infrastructure.git//terraform/modules/sqs-queue?ref=master"
  env                         = var.env
  queue_name                  = each.value
  content_based_deduplication = var.content_based_deduplication
  delay_seconds               = var.delay_seconds
  max_message_size            = var.max_message_size
  message_retention_seconds   = var.message_retention_seconds
  receive_wait_time_seconds   = var.receive_wait_time_seconds
  max_receive_count           = var.max_receive_count
  create_dlq                  = var.create_dlq
  fifo_queue                  = var.fifo_queue
}