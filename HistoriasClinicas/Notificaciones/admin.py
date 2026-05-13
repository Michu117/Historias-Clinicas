from django.contrib import admin

from .models import Notificacion


@admin.register(Notificacion)
class NotificacionAdmin(admin.ModelAdmin):
    list_display = (
        'id',
        'tipo',
        'estado',
        'usuario_destinatario',
        'cita',
        'fecha_creacion',
    )
    list_filter = ('tipo', 'estado', 'fecha_creacion')
    search_fields = ('mensaje', 'cita__id', 'origen_evento')
    readonly_fields = ('fecha_creacion', 'fecha_modificacion')
