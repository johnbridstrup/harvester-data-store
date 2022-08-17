from django.apps import AppConfig


class CommonConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'common'

    def ready(self):
        import os
        if os.environ.get("PROMETHEUS_MULTIPROC_DIR", None):
            from prometheus_client import values

            values.ValueClass = values.MultiProcessValue(
                process_identifier=os.getpid
            )
        
