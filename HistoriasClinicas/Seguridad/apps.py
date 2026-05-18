from pathlib import Path
from django.apps import AppConfig


class SeguridadConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "Seguridad"
    path = str(Path(__file__).resolve().parent)