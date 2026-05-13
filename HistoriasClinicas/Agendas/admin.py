from django.contrib import admin

from .models import (
    Servicio, Cita, SignosVitales,
    ConsultaMedica, ConsultaOdontologica, ConsultaPsicologica,
    ConsultaSocial, Derivacion, Certificado
)

admin.site.register(Servicio)
admin.site.register(Cita)
admin.site.register(SignosVitales)
admin.site.register(ConsultaMedica)
admin.site.register(ConsultaOdontologica)
admin.site.register(ConsultaPsicologica)
admin.site.register(ConsultaSocial)
admin.site.register(Derivacion)
admin.site.register(Certificado)
