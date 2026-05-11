from django.core.exceptions import ValidationError
from django.core.validators import FileExtensionValidator
from django.db import models


def validate_non_empty_file(value):
    if value and value.size == 0:
        raise ValidationError("El archivo no puede estar vacio.")


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


class TipoAntecedente(models.TextChoices):
    HEREDOFAMILIARES = "HEREDOFAMILIARES", "Heredofamiliares"
    PERSONALES_NO_PATOLOGICOS = (
        "PERSONALES_NO_PATOLOGICOS",
        "Personales no patologicos",
    )
    PERSONALES_PATOLOGICOS = "PERSONALES_PATOLOGICOS", "Personales patologicos"
    GINECO_OBSTETRICOS = "GINECO_OBSTETRICOS", "Gineco obstetricos"


class TipoDocumento(models.TextChoices):
    RESULTADOS = "RESULTADOS", "Resultados"
    FORMULARIOS = "FORMULARIOS", "Formularios"
    CONSENTIMIENTOS = "CONSENTIMIENTOS", "Consentimientos"
    CERTIFICADO = "CERTIFICADO", "Certificado"


class HistoriaClinica(TimestampedModel):
    alergia = models.TextField("alergia")
    condicion_preexistente = models.TextField("condicion preexistente")
    factor_riesgo = models.TextField("factor de riesgo")
    antecedente_personal = models.TextField("antecedente personal")
    antecedente_familiar = models.TextField("antecedente familiar")

    class Meta:
        verbose_name = "historia clinica"
        verbose_name_plural = "historias clinicas"
        ordering = ("-created_at",)

    def __str__(self):
        return f"Historia clinica #{self.pk}"


class Caso(TimestampedModel):
    historia_clinica = models.ForeignKey(
        HistoriaClinica,
        on_delete=models.CASCADE,
        related_name="casos",
        verbose_name="historia clinica",
    )
    fecha_apertura = models.DateField("fecha de apertura")
    fecha_cierre = models.DateField("fecha de cierre", null=True, blank=True)
    estado = models.CharField(
        "estado",
        max_length=20,
        choices=EstadoCaso.choices,
        default=EstadoCaso.ABIERTO,
    )
    prioridad = models.CharField(
        "prioridad",
        max_length=10,
        choices=Prioridad.choices,
        default=Prioridad.MEDIA,
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
        if self.estado == EstadoCaso.CERRADO and not self.fecha_cierre:
            raise ValidationError(
                {"fecha_cierre": "La fecha de cierre es obligatoria cuando el caso esta cerrado."}
            )

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Caso #{self.pk} ({self.get_estado_display()})"


class Antecedente(TimestampedModel):
    historia_clinica = models.ForeignKey(
        HistoriaClinica,
        on_delete=models.CASCADE,
        related_name="antecedentes",
        verbose_name="historia clinica",
    )
    descripcion = models.TextField("descripcion")
    fecha = models.DateField("fecha")
    tipo_antecedente = models.CharField(
        "tipo de antecedente",
        max_length=30,
        choices=TipoAntecedente.choices,
    )

    class Meta:
        verbose_name = "antecedente"
        verbose_name_plural = "antecedentes"
        ordering = ("-fecha",)

    def __str__(self):
        return f"{self.get_tipo_antecedente_display()} ({self.fecha})"


class Documento(TimestampedModel):
    historia_clinica = models.ForeignKey(
        HistoriaClinica,
        on_delete=models.CASCADE,
        related_name="documentos",
        verbose_name="historia clinica",
    )
    fecha = models.DateField("fecha")
    tipo_documento = models.CharField(
        "tipo de documento",
        max_length=20,
        choices=TipoDocumento.choices,
    )
    archivo = models.FileField(
        "archivo",
        upload_to="documentos/",
        validators=[
            FileExtensionValidator(
                allowed_extensions=["pdf", "jpg", "jpeg", "png"],
                message="El archivo debe ser PDF o imagen (jpg, jpeg, png).",
            ),
            validate_non_empty_file,
        ],
    )

    class Meta:
        verbose_name = "documento"
        verbose_name_plural = "documentos"
        ordering = ("-fecha",)

    def __str__(self):
        return f"{self.get_tipo_documento_display()} ({self.fecha})"
