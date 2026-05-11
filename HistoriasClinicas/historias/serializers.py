import os

from rest_framework import serializers

from .models import (
    Antecedente,
    Caso,
    Documento,
    EstadoCaso,
    HistoriaClinica,
    Prioridad,
    TipoAntecedente,
    TipoDocumento,
)


class CasoSerializer(serializers.ModelSerializer):
    estado = serializers.ChoiceField(choices=EstadoCaso.choices)
    prioridad = serializers.ChoiceField(choices=Prioridad.choices)

    class Meta:
        model = Caso
        fields = (
            "id",
            "historia_clinica",
            "fecha_apertura",
            "fecha_cierre",
            "estado",
            "prioridad",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("id", "created_at", "updated_at")

    def validate(self, attrs):
        fecha_apertura = attrs.get("fecha_apertura", getattr(self.instance, "fecha_apertura", None))
        fecha_cierre = attrs.get("fecha_cierre", getattr(self.instance, "fecha_cierre", None))
        estado = attrs.get("estado", getattr(self.instance, "estado", None))

        if fecha_apertura and fecha_cierre and fecha_cierre < fecha_apertura:
            raise serializers.ValidationError(
                {"fecha_cierre": "La fecha de cierre no puede ser anterior a la fecha de apertura."}
            )

        if estado == EstadoCaso.CERRADO and not fecha_cierre:
            raise serializers.ValidationError(
                {"fecha_cierre": "La fecha de cierre es obligatoria cuando el caso esta cerrado."}
            )

        return attrs


class AntecedenteSerializer(serializers.ModelSerializer):
    tipo_antecedente = serializers.ChoiceField(choices=TipoAntecedente.choices)

    class Meta:
        model = Antecedente
        fields = (
            "id",
            "historia_clinica",
            "descripcion",
            "fecha",
            "tipo_antecedente",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("id", "created_at", "updated_at")


class DocumentoSerializer(serializers.ModelSerializer):
    tipo_documento = serializers.ChoiceField(choices=TipoDocumento.choices)

    class Meta:
        model = Documento
        fields = (
            "id",
            "historia_clinica",
            "fecha",
            "tipo_documento",
            "archivo",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("id", "created_at", "updated_at")

    def validate_archivo(self, value):
        if not value:
            raise serializers.ValidationError("El archivo es obligatorio.")

        if value.size == 0:
            raise serializers.ValidationError("El archivo no puede estar vacio.")

        extension = os.path.splitext(value.name)[1].lower().lstrip(".")
        if extension not in {"pdf", "jpg", "jpeg", "png"}:
            raise serializers.ValidationError("El archivo debe ser PDF o imagen (jpg, jpeg, png).")

        return value


class HistoriaClinicaSerializer(serializers.ModelSerializer):
    casos = CasoSerializer(many=True, read_only=True)
    antecedentes = AntecedenteSerializer(many=True, read_only=True)
    documentos = DocumentoSerializer(many=True, read_only=True)

    class Meta:
        model = HistoriaClinica
        fields = (
            "id",
            "alergia",
            "condicion_preexistente",
            "factor_riesgo",
            "antecedente_personal",
            "antecedente_familiar",
            "created_at",
            "updated_at",
            "casos",
            "antecedentes",
            "documentos",
        )
        read_only_fields = ("id", "created_at", "updated_at")
