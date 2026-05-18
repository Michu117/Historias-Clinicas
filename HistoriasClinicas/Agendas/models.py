from django.db import models
from django.utils import timezone


class Servicio(models.Model):
    nombre = models.CharField(max_length=120)
    descripcion = models.TextField(blank=True)
    es_activo = models.BooleanField(default=True)
    fecha_creacion = models.DateTimeField(default=timezone.now)

    class Meta:
        ordering = ['nombre']

    def __str__(self):
        return self.nombre


class EstadoCita(models.TextChoices):
    AGENDADA = 'AGENDADA', 'Agendada'
    CONFIRMADA = 'CONFIRMADA', 'Confirmada'
    ATENDIDA = 'ATENDIDA', 'Atendida'
    CANCELADA = 'CANCELADA', 'Cancelada'
    NO_ASISTIDA = 'NO_ASISTIDA', 'No asistida'


class Cita(models.Model):
    usuario_id = models.IntegerField()
    fecha_hora = models.DateTimeField()
    estado = models.CharField(
        max_length=16,
        choices=EstadoCita.choices,
        default=EstadoCita.AGENDADA,
    )
    motivo = models.CharField(max_length=255, blank=True)
    servicios = models.ManyToManyField(Servicio, related_name='citas', blank=True)
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    fecha_actualizacion = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-fecha_hora']
        unique_together = [['usuario_id', 'fecha_hora']]

    def __str__(self):
        return f'Cita {self.id} - Usuario {self.usuario_id} el {self.fecha_hora}'

    def contar_consultas(self):
        return (
            self.consultamedica_consultas.count() +
            self.consultaodontologica_consultas.count() +
            self.consultapsicologica_consultas.count() +
            self.consultasocial_consultas.count()
        )


class SignosVitales(models.Model):
    peso_kg = models.DecimalField(max_digits=5, decimal_places=2)
    temperatura = models.DecimalField(max_digits=4, decimal_places=1)
    presion_arterial = models.CharField(max_length=32)
    frecuencia_cardiaca = models.PositiveIntegerField()

    def __str__(self):
        return f'Signos vitales {self.id} - {self.peso_kg}kg'


class Consulta(models.Model):
    cita = models.ForeignKey(
        Cita,
        on_delete=models.CASCADE,
        related_name='%(class)s_consultas',
    )
    historia_clinica_id = models.IntegerField()
    observaciones = models.TextField(blank=True)
    servicios = models.ManyToManyField(
        Servicio,
        related_name='%(app_label)s_%(class)s_servicios',
        blank=True,
    )
    fecha_creacion = models.DateTimeField(auto_now_add=True)

    class Meta:
        abstract = True

    def __str__(self):
        return f'Consulta {self.__class__.__name__} {self.id} para cita {self.cita.id}'


class ConsultaMedica(Consulta):
    anamnesis = models.TextField()
    tratamiento = models.TextField()
    diagnostico = models.TextField()
    signos_vitales = models.ForeignKey(SignosVitales, on_delete=models.CASCADE)


class ConsultaOdontologica(Consulta):
    odontograma = models.TextField()
    procedimientos = models.TextField()


class ConsultaPsicologica(Consulta):
    notas_evolucion = models.TextField(blank=True)
    estado_humor = models.CharField(max_length=120, blank=True)
    nivel_ansiedad = models.PositiveIntegerField(default=0)
    nivel_autoestima = models.PositiveIntegerField(default=0)
    diagnostico = models.TextField()


class ConsultaSocial(Consulta):
    nivel_socioeconomico = models.CharField(max_length=120, blank=True)
    descripcion_vivienda = models.TextField(blank=True)


class TipoDerivacion(models.TextChoices):
    INTERNA = 'INTERNA', 'Interna'
    EXTERNA = 'EXTERNA', 'Externa'


class EstadoDerivacion(models.TextChoices):
    PENDIENTE = 'PENDIENTE', 'Pendiente'
    ACEPTADA = 'ACEPTADA', 'Aceptada'
    RECHAZADA = 'RECHAZADA', 'Rechazada'


class Derivacion(models.Model):
    usuario_id = models.IntegerField()
    remitente_id = models.IntegerField()
    destinatario = models.CharField(max_length=150)
    tipo = models.CharField(max_length=10, choices=TipoDerivacion.choices)
    motivo = models.TextField()
    estado = models.CharField(max_length=10, choices=EstadoDerivacion.choices, default=EstadoDerivacion.PENDIENTE)
    fecha_creacion = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-fecha_creacion']

    def __str__(self):
        return f'Derivación {self.tipo} para usuario {self.usuario_id}'


class Certificado(models.Model):
    cita = models.ForeignKey(Cita, on_delete=models.CASCADE, related_name='certificados')
    tipo = models.CharField(max_length=100)
    archivo = models.FileField(upload_to='certificados/', blank=True, null=True)
    fecha_emision = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-fecha_emision']

    def __str__(self):
        return f'Certificado {self.tipo} para cita {self.cita.id}'

