from prometheus_client import Summary


METHOD_TIMER = Summary("hds_method_time", "HDS method timer", labelnames=["view", "method"])
