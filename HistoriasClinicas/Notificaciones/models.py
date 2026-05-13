from django.conf import settings
from django.db import models


class Notificacion(models.Model):
    ESTADO_NO_LEIDO = 'no_leido'
    ESTADO_LEIDO = 'leido'
    ESTADO_CHOICES = [
        (ESTADO_NO_LEIDO, 'No leído'),
        (ESTADO_LEIDO, 'Leído'),
    ]

    TIPO_CREACION = 'creacion'
    TIPO_CONFIRMACION = 'confirmacion'
    TIPO_REAGENDA = 'reagendamiento'
    TIPO_CANCELACION = 'cancelacion'
    TIPO_DERIVACION = 'derivacion'
    TIPO_CHOICES = [
        (TIPO_CREACION, 'Creación'),
        (TIPO_CONFIRMACION, 'Confirmación'),
        (TIPO_REAGENDA, 'Reagendamiento'),
        (TIPO_CANCELACION, 'Cancelación'),
        (TIPO_DERIVACION, 'Derivación'),
    ]

    usuario_destinatario = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        related_name='notificaciones_recibidas',
        on_delete=models.CASCADE,
    )
    cita_id = models.CharField(max_length=64, blank=True, null=True)
    tipo = models.CharField(max_length=32, choices=TIPO_CHOICES)
    estado = models.CharField(
        max_length=16,
        choices=ESTADO_CHOICES,
        default=ESTADO_NO_LEIDO,
    )
    mensaje = models.TextField()
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    fecha_modificacion = models.DateTimeField(auto_now=True)
    usuario_creacion = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        related_name='notificaciones_creadas',
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
    )
    usuario_modificacion = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        related_name='notificaciones_modificadas',
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
    )
    origen_evento = models.CharField(max_length=64)
    detalles = models.JSONField(blank=True, null=True, default=dict)

    class Meta:
        ordering = ['-fecha_creacion']
        verbose_name = 'Notificación'
        verbose_name_plural = 'Notificaciones'

    def __str__(self):
        return f'Notificación {self.id} ({self.tipo}) para {self.usuario_destinatario}'
