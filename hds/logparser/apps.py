from django.apps import AppConfig


class LogparserConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'logparser'

    def ready(self):
        from .beat import check_extracts_dir_size
