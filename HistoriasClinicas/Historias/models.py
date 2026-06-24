from django.core.exceptions import ValidationError
from django.db import models
from Seguridad.models import Usuario


class TimestampedModel(models.Model):
    created_at = models.DateTimeField("creado en", auto_now_add=True)
    updated_at = models.DateTimeField("actualizado en", auto_now=True)

    class Meta:
        abstract = True


class EstadoCaso(models.TextChoices):
    ABIERTO = "ABIERTO", "Abierto"
    EN_SEGUIMIENTO = "EN_SEGUIMIENTO", "En seguimiento"
    CERRADO = "CERRADO", "Cerrado"


class Prioridad(models.TextChoices):
    ALTA = "ALTA", "Alta"
    MEDIA = "MEDIA", "Media"
    BAJA = "BAJA", "Baja"


class TipoRegistroClinico(models.TextChoices):
    ALERGIA = "ALERGIA", "Alergia"
    FACTOR_RIESGO = "FACTOR_RIESGO", "Factor de riesgo"


class TipoAntecedente(models.TextChoices):
    HEREDOFAMILIARES = "HEREDOFAMILIARES", "Heredofamiliares"
    PERSONALES_NO_PATOLOGICOS = ("PERSONALES_NO_PATOLOGICOS","Personales no patologicos",)
    PERSONALES_PATOLOGICOS = "PERSONALES_PATOLOGICOS", "Personales patologicos"
    GINECO_OBSTETRICOS = "GINECO_OBSTETRICOS", "Gineco obstetricos"


class TipoDocumento(models.TextChoices):
    RESULTADO = "RESULTADO", "Resultado"
    FORMULARIOS = "FORMULARIOS", "Formularios"
    CONSENTIMIENTO = "CONSENTIMIENTO", "Consentimiento"
    CERTIFICADO = "CERTIFICADO", "Certificado"


def _validar_texto_requerido(valor: str | None, campo: str) -> None:
    if valor is None or not valor.strip():
        raise ValidationError({campo: "Este campo es obligatorio y no puede estar vacio."})


class HistoriaClinica(TimestampedModel):
    alergia = models.TextField("alergia")
    condicion_preexistente = models.TextField("condicion preexistente")
    factor_riesgo = models.TextField("factor de riesgo")
    usuario = models.OneToOneField(Usuario,on_delete=models.CASCADE,related_name='historia_clinica')
    class Meta:
        verbose_name = "historia clinica"
        verbose_name_plural = "Historias clinicas"
        ordering = ("-created_at",)

    def __str__(self):
        return f"Historia clinica #{self.pk}"

    def clean(self):
        super().clean()
        _validar_texto_requerido(self.alergia, "alergia")
        _validar_texto_requerido(self.condicion_preexistente, "condicion_preexistente")
        _validar_texto_requerido(self.factor_riesgo, "factor_riesgo")


class Caso(TimestampedModel):
    historia_clinica = models.ForeignKey(HistoriaClinica,on_delete=models.CASCADE,related_name="casos",verbose_name="historia clinica",)
    fecha_apertura = models.DateField("fecha de apertura")
    fecha_cierre = models.DateField("fecha de cierre", null=True, blank=True)
    estado_caso = models.CharField("estado del caso", max_length=20, choices=EstadoCaso.choices, default=EstadoCaso.ABIERTO, )
    prioridad = models.CharField("prioridad", max_length=10,choices=Prioridad.choices,default=Prioridad.MEDIA,
    )

    class Meta:
        verbose_name = "caso"
        verbose_name_plural = "casos"
        ordering = ("-fecha_apertura",)

    def clean(self):
        super().clean()
        if self.fecha_cierre and self.fecha_apertura and self.fecha_cierre < self.fecha_apertura:
            raise ValidationError(
                {"fecha_cierre": "La fecha de cierre no puede ser anterior a la fecha de apertura."}
            )
        if self.estado_caso == EstadoCaso.CERRADO and not self.fecha_cierre:
            raise ValidationError(
                {"fecha_cierre": "La fecha de cierre es obligatoria cuando el caso esta cerrado."}
            )

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Caso #{self.pk} ({self.get_estado_caso_display()})"


class Antecedente(TimestampedModel):
    historia_clinica = models.ForeignKey(HistoriaClinica,on_delete=models.CASCADE, related_name="antecedentes",verbose_name="historia clinica",)
    descripcion = models.TextField("descripcion")
    fecha = models.DateField("fecha")
    tipo_antecedente = models.CharField("tipo de antecedente",max_length=30,choices=TipoAntecedente.choices,)

    class Meta:
        verbose_name = "antecedente"
        verbose_name_plural = "antecedentes"
        ordering = ("-fecha",)

    def __str__(self):
        return f"{self.get_tipo_antecedente_display()} ({self.fecha})"

    def clean(self):
        super().clean()
        _validar_texto_requerido(self.descripcion, "descripcion")


class Documento(TimestampedModel):
    historia_clinica = models.ForeignKey(HistoriaClinica, on_delete=models.CASCADE, related_name="documentos", verbose_name="historia clinica",)
    fecha = models.DateField("fecha")
    tipo_documento = models.CharField("tipo de documento", max_length=20, choices=TipoDocumento.choices,)
    encabezado = models.TextField("encabezado")
    cuerpo = models.TextField("cuerpo")

    class Meta:
        verbose_name = "documento"
        verbose_name_plural = "documentos"
        ordering = ("-fecha",)

    def __str__(self):
        return f"{self.get_tipo_documento_display()} ({self.fecha})"

    def clean(self):
        super().clean()
        _validar_texto_requerido(self.encabezado, "encabezado")
        _validar_texto_requerido(self.cuerpo, "cuerpo")


class RegistroClinicoHistoria(TimestampedModel):
    historia_clinica = models.ForeignKey(
        HistoriaClinica,
        on_delete=models.CASCADE,
        related_name="registros_clinicos",
        verbose_name="historia clínica",
    )
    tipo = models.CharField(
        "tipo",
        max_length=20,
        choices=TipoRegistroClinico.choices,
    )
    descripcion = models.TextField("descripción")
    fecha_registro = models.DateTimeField("fecha de registro", auto_now_add=True)
    medico_registro = models.ForeignKey(
        Usuario,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="registros_creados",
        verbose_name="médico que registró",
    )
    activo = models.BooleanField("activo", default=True)

    class Meta:
        verbose_name = "registro clínico"
        verbose_name_plural = "registros clínicos"
        ordering = ("-fecha_registro",)

    def __str__(self):
        return f"{self.get_tipo_display()} - {self.descripcion[:50]}"
