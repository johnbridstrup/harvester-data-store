from prometheus_client import Counter, Gauge
from pkg.log import get_logger

SERVICE_STATE_VALUES = {
    "RUNNING": 0,
    "STARTING": 1,
    "STOPPED": 2,
    "STOPPING": 3,
    "EXITED": 4,
    "BACKOFF": 5,
    "FATAL": 6,
    "UNKNOWN": 7,
}

# Possible we are also okay with STARTING, but if every time we check its trying to start
# then that's not really okay.
OK_STATES = ["RUNNING", "STARTING"] 

ServiceStateGauge = Gauge(
    "supervisor_service_state", 
    "Supervisor Service State", 
    labelnames=["service"],
)

ServiceUptime = Gauge(
    "supervisor_service_uptime",
    "Supervisor Service Uptime",
    labelnames=["service"],
)

ServiceCrashCount = Counter(
    "supervisor_service_crash_count", 
    "Supervisor Service Crash Count", 
    labelnames=["service"], 
)

SupervisorConnected = Gauge(
    "supervisor_connected",
    "Supervisor Connected",
)

class SupervisorMetrics:
    def __init__(self, opts):
        self.service_last_state = {}
        self.logger = get_logger("supervisor-metrics", opts.log_level)

    def service_state_update(self, service, state):
        ServiceStateGauge.labels(service).set(SERVICE_STATE_VALUES[state])
        last_state = self.service_last_state.get(service, None)

        is_ok = state in OK_STATES
        is_new_state = last_state != state

        if is_new_state and not is_ok:
            ServiceCrashCount.labels(service).inc()
        
        self.service_last_state[service] = state

    def service_uptime_update(self, service, uptime, state):
        if not state in OK_STATES:
            uptime = 0
        ServiceUptime.labels(service).set(uptime)
    
    def set_supervisor_connected(self, connected: int):
        SupervisorConnected.set(connected)
