import os, shutil, structlog

from prometheus_client import Gauge

from common.celery import monitored_shared_task
from common.metrics import prometheus_get_registry
from .serializers.logvideoserializers import EXTRACT_DIR

logger = structlog.get_logger(__name__)

EXTRACTS_SIZE_GAUGE = Gauge(
    "extracts_dir_size",
    "The size, in kB, of the extracts directory",
    registry=prometheus_get_registry()
)

def get_dir_size(dir_path):
    total_size = 0
    if not os.path.exists(dir_path):
        raise OSError(f"{dir_path} does not exist")
    for dirpath, dirnames, filenames in os.walk(dir_path):
        for f in filenames:
            fp = os.path.join(dirpath, f)
            if not os.path.islink(fp):
                total_size += os.path.getsize(fp)
    return total_size

@monitored_shared_task
def check_extracts_dir_size():
    dir_size = get_dir_size(EXTRACT_DIR)/1000.0
    EXTRACTS_SIZE_GAUGE.set(dir_size)
    return f"Extracts dir size: {dir_size} kB"

@monitored_shared_task
def clean_extracts_dir():
    if not os.path.exists(EXTRACT_DIR):
        raise OSError(f"{EXTRACT_DIR} does not exist.")
    
    for f in os.listdir(EXTRACT_DIR):
        try:
            if os.path.isfile(f):
                os.unlink(f)
            elif os.path.isdir(f):
                shutil.rmtree(f)
        except Exception as e:
            exc = type(e).__name__
            logger.error(
                f"Failed to delete {f}:\n\t{e}",
                exception_name=exc,
                exception_info=str(e)
            )
    return "Clean extracts directory."