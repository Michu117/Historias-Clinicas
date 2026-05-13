from pathlib import Path
from django.apps import AppConfig

class NotificacionesConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "Notificaciones"
    path = str(Path(__file__).resolve().parent)