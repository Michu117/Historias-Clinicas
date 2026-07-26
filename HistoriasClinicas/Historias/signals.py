from django.db.models.signals import post_save
from django.dispatch import receiver
from Seguridad.models import Usuario
from Historias.models import HistoriaClinica


@receiver(post_save, sender=Usuario)
def crear_historia_clinica_usuario(sender, instance, created, **kwargs):
    if created:
        HistoriaClinica.objects.get_or_create(
            usuario=instance,
            defaults={
                "alergia": "Sin registro",
                "condicion_preexistente": "Sin registro",
                "factor_riesgo": "Sin registro",
            },
        )
