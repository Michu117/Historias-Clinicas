from django.db import models


# Clase separada para mantener el modelo limpio
class TipoReporte(models.TextChoices):
    ESTADISTICO_GENERAL = 'GENERAL', 'Estadístico General de Consultas'
    POR_ESPECIALIDAD = 'ESPECIALIDAD', 'Consultas por Tipo de Atención'


class Reporte(models.Model):
    titulo = models.CharField(max_length=255)
    tipo = models.CharField(
        max_length=20,
        choices=TipoReporte.choices,
        default=TipoReporte.ESTADISTICO_GENERAL
    )

    fecha_inicio = models.DateField()
    fecha_fin = models.DateField()

    # Filtro opcional: si es NULL, el reporte es de TODOS los servicios
    servicio = models.ForeignKey('Agendas.Servicio', on_delete=models.SET_NULL, null=True, blank=True)
    profesional = models.ForeignKey('Seguridad.Usuario', on_delete=models.SET_NULL, null=True, blank=True)

    fecha_generado = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.titulo} ({self.fecha_inicio} a {self.fecha_fin})"