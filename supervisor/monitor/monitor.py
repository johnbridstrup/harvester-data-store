import time
from argparse import ArgumentParser
from prometheus_client import start_http_server

from pkg.log import get_logger
from pkg.metrics import SupervisorMetrics
from pkg.supervisor import SupervisorServer
from pkg.utils import available_port

parser = ArgumentParser()
parser.add_argument("-l", "--log-level", help="Log level", default="INFO", choices=["DEBUG", "INFO", "WARNING", "ERROR", "CRITICAL"])
parser.add_argument("-c", "--config", help="Path to supervisord.conf", required=True)
parser.add_argument("-p", "--port", help="Port to run the prometheus server", default=9151, type=available_port)
parser.add_argument("-w", "--wait-time", help="Time (seconds) to wait before attempting to reconnect to supervisor", default=15, type=int)


def main():
    opts = parser.parse_args()
    port = opts.port
    log_level = opts.log_level
    config = opts.config
    wait_time = opts.wait_time
    start_http_server(port)
    logger = get_logger("supervisor-monitor", log_level)
    logger.info(f"Prometheus server started on port {port}")
    
    
    metrics = SupervisorMetrics(opts)
    metrics.set_supervisor_connected(0)
    server = SupervisorServer(config, opts)
    if not server.config:
        logger.error("No configuration found")
        raise RuntimeError(f"No configuration found at {config}")

    logger.info("Starting Monitor Service")
    server.wait_connected()
    metrics.set_supervisor_connected(1)
    try:
        while True:
            logger.info("Gathering process info")
            process_info = server.get_process_info()

            for process in process_info:
                service = process["name"]
                state = process["statename"]
                start = process["start"]
                now = process["now"]
                uptime = now - start

                metrics.service_state_update(service, state)
                metrics.service_uptime_update(service, uptime, state)
            time.sleep(wait_time)
    except KeyboardInterrupt:
        logger.info("Monitor Service Stopped by User")
    except Exception:
        logger.exception("Error in Monitor Service")
        logger.error("Monitor Service Stopped")
    finally:
        metrics.set_supervisor_connected(0)

if __name__ == "__main__":
    main()