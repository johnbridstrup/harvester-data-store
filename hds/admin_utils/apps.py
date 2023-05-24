from django.apps import AppConfig


class AdminUtilsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'admin_utils'

    def ready(self) -> None:
        from .tasks import clean_beatbox  # tasks need to be imported to register
