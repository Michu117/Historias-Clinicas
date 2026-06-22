from pathlib import Path
from django.apps import AppConfig


class HistoriasConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "Historias"
    path = str(Path(__file__).resolve().parent)

    def ready(self):
        import historias.signals  # noqa: F401