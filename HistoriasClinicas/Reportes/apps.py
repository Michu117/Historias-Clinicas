from pathlib import Path
from django.apps import AppConfig


class ReportesConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "Reportes"
    path = str(Path(__file__).resolve().parent)