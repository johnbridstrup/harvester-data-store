# Monitor Service

This is a simple python service which utilizes the `supervisord` RPC interface to monitor
the services running in the container. It uses the `prometheus_client` to host a metrics
endpoint and pushes uptime, service state and service crash count metrics. 

### Usage
```
$ monitor --config /path/to/conf.d
```

### Params
- `--config`, `-c` - the path to the supervisor config file
- `--wait_time`, `-w` - the time in seconds between RPC calls
- `--log-level`, `-l` - log level {"DEBUG", "INFO", "WARNING", "ERROR", "CRITIAL"}
- `--port`, `-p` - Port to host the prometheus server
