from .celery import app as hds_celery
import logging


__all__ = ('hds_celery',)

# Suppress rest_framework_roles logging 
logging.getLogger("rest_framework_roles.patching").setLevel(logging.CRITICAL)