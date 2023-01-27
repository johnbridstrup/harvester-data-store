from celery import shared_task
from functools import wraps

from .async_metrics import ASYNC_TASK_COUNTER, ASYNC_ERROR_COUNTER, ASYNC_TASK_TIMER

def monitored_shared_task(*args, **kwargs):
    """Decorator for celery task metrics

    This decorator extends the celery.shared_task decorator to automatically capture
    metrics during task execution.

    METRICS:
        ASYNC_TASK_COUNTER (Counter): Task executions
        ASYNC_TASK_TIMER (Histogram): Statistics on task duration
        ASYNC_ERROR_COUNTER (Counter): Errors during task execution
    """
    def do_metrics(func):
        @wraps(func)
        def _wrapper(*args, **kwargs):
            ASYNC_TASK_COUNTER.labels(func.__name__).inc()
            summary = ASYNC_TASK_TIMER.labels(func.__name__)
            with summary.time():
                try:
                    output = func(*args, **kwargs)
                except Exception as e:
                    exc = type(e).__name__
                    ASYNC_ERROR_COUNTER.labels(func.__name__, exc, str(e)).inc()
                    raise
            return output
        return _wrapper
    
    # shared_task can optionally take arguments, we must handle both cases
    if len(args) == 1 and callable(args[0]):
        return shared_task(do_metrics(args[0]))

    wrap = shared_task(*args, **kwargs)
    wrapper = lambda func: wrap(do_metrics(func))
    return wrapper