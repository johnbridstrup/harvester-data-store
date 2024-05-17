from django.apps import AppConfig
from django.core.management import call_command
from django.db.models.signals import post_migrate


def populate_histories(**kwargs):
    # Automatically create initial history objects after migration
    call_command("populate_history", auto=True)


class CommonConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "common"

    def ready(self):
        import os

        if os.environ.get("PROMETHEUS_MULTIPROC_DIR", None):
            from prometheus_client import values

            values.ValueClass = values.MultiProcessValue(
                process_identifier=os.getpid
            )

        post_migrate.connect(populate_histories, sender=self)
