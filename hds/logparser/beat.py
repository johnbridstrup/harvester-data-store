import os

from celery import shared_task
from prometheus_client import Gauge

from common.metrics import prometheus_get_registry
from .serializers.logvideoserializers import EXTRACT_DIR

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

@shared_task
def check_extracts_dir_size():
    dir_size = get_dir_size(EXTRACT_DIR)/1000.0
    EXTRACTS_SIZE_GAUGE.set(dir_size)
    return f"Extracts dir size: {dir_size} kB"