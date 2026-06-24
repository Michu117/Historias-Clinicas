from rest_framework import serializers

from Seguridad.models import Usuario

from .models import (
    Antecedente,
    Caso,
    Documento,
    EstadoCaso,
    HistoriaClinica,
    Prioridad,
    RegistroClinicoHistoria,
    TipoAntecedente,
    TipoDocumento,
)


class CasoSerializer(serializers.ModelSerializer):
    estado_caso = serializers.ChoiceField(choices=EstadoCaso.choices)
    prioridad = serializers.ChoiceField(choices=Prioridad.choices)

    class Meta:
        model = Caso
        fields = ("id","historia_clinica","fecha_apertura","fecha_cierre","estado_caso","prioridad","created_at","updated_at",)
        read_only_fields = ("id", "historia_clinica", "created_at", "updated_at")

    def validate(self, attrs):
        fecha_apertura = attrs.get("fecha_apertura", getattr(self.instance, "fecha_apertura", None))
        fecha_cierre = attrs.get("fecha_cierre", getattr(self.instance, "fecha_cierre", None))
        estado_caso = attrs.get("estado_caso", getattr(self.instance, "estado_caso", None))

        if fecha_apertura and fecha_cierre and fecha_cierre < fecha_apertura:
            raise serializers.ValidationError(
                {"fecha_cierre": "La fecha de cierre no puede ser anterior a la fecha de apertura."}
            )

        if estado_caso == EstadoCaso.CERRADO and not fecha_cierre:
            raise serializers.ValidationError(
                {"fecha_cierre": "La fecha de cierre es obligatoria cuando el caso esta cerrado."}
            )

        return attrs


class AntecedenteSerializer(serializers.ModelSerializer):
    tipo_antecedente = serializers.ChoiceField(choices=TipoAntecedente.choices)

    class Meta:
        model = Antecedente
        fields = ("id","historia_clinica","descripcion","fecha","tipo_antecedente","created_at","updated_at",
        )
        read_only_fields = ("id", "historia_clinica", "created_at", "updated_at")

    def validate_descripcion(self, value):
        if value is None or not value.strip():
            raise serializers.ValidationError("Este campo es obligatorio y no puede estar vacio.")
        return value.strip()

class DocumentoSerializer(serializers.ModelSerializer):
    tipo_documento = serializers.ChoiceField(choices=TipoDocumento.choices)

    class Meta:
        model = Documento
        fields = ("id","historia_clinica","fecha","encabezado","cuerpo","tipo_documento","created_at","updated_at",)
        read_only_fields = ("id", "historia_clinica", "created_at", "updated_at")

    def validate_encabezado(self, value):
        if value is None or not value.strip():
            raise serializers.ValidationError("Este campo es obligatorio y no puede estar vacio.")
        return value.strip()

    def validate_cuerpo(self, value):
        if value is None or not value.strip():
            raise serializers.ValidationError("Este campo es obligatorio y no puede estar vacio.")
        return value.strip()

class RegistroClinicoHistoriaSerializer(serializers.ModelSerializer):
    medico_registro_nombre = serializers.SerializerMethodField()

    class Meta:
        model = RegistroClinicoHistoria
        fields = (
            "id",
            "historia_clinica",
            "tipo",
            "descripcion",
            "fecha_registro",
            "medico_registro",
            "medico_registro_nombre",
            "activo",
            "created_at",
            "updated_at",
        )
        read_only_fields = (
            "id",
            "historia_clinica",
            "fecha_registro",
            "medico_registro",
            "medico_registro_nombre",
            "activo",
            "created_at",
            "updated_at",
        )

    def get_medico_registro_nombre(self, obj):
        if obj.medico_registro:
            return obj.medico_registro.nombre_completo
        return None

    def validate_descripcion(self, value):
        if value is None or not value.strip():
            raise serializers.ValidationError("Este campo es obligatorio y no puede estar vacio.")
        return value.strip()


class ConsultaHistoriaSerializer(serializers.Serializer):
    id = serializers.IntegerField(read_only=True)
    tipo = serializers.CharField(read_only=True)
    fecha = serializers.DateTimeField(read_only=True)
    motivo = serializers.CharField(read_only=True)
    estado = serializers.CharField(read_only=True)
    observaciones = serializers.CharField(read_only=True, allow_blank=True)
    anamnesis = serializers.CharField(read_only=True, allow_null=True)
    diagnostico = serializers.CharField(read_only=True, allow_null=True)
    tratamiento = serializers.CharField(read_only=True, allow_null=True)
    signos_vitales = serializers.JSONField(read_only=True, allow_null=True)
    servicios = serializers.ListField(child=serializers.CharField(), read_only=True, allow_empty=True)
    historia_clinica_id = serializers.IntegerField(read_only=True)


class UsuarioHistoriaSerializer(serializers.ModelSerializer):
    nombre = serializers.CharField(source="nombre_completo", read_only=True)
    identificacion = serializers.CharField(source="cedula", read_only=True)

    class Meta:
        model = Usuario
        fields = (
            "id",
            "nombre",
            "identificacion",
            "nombres",
            "apellidos",
            "cedula",
        )


class HistoriaClinicaSerializer(serializers.ModelSerializer):
    casos = CasoSerializer(many=True, read_only=True)
    antecedentes = AntecedenteSerializer(many=True, read_only=True)
    documentos = DocumentoSerializer(many=True, read_only=True)
    usuario = UsuarioHistoriaSerializer(read_only=True)
    usuario_id = serializers.PrimaryKeyRelatedField(
        source="usuario",
        queryset=Usuario.objects.all(),
        write_only=True,
        required=False,
    )

    class Meta:
        model = HistoriaClinica
        fields = ("id","usuario","usuario_id","alergia","condicion_preexistente","factor_riesgo","created_at","updated_at","casos","antecedentes","documentos",)
        read_only_fields = ("id", "usuario", "created_at", "updated_at")

    def validate_alergia(self, value):
        if value is None or not value.strip():
            raise serializers.ValidationError("Este campo es obligatorio y no puede estar vacio.")
        return value.strip()

    def validate_condicion_preexistente(self, value):
        if value is None or not value.strip():
            raise serializers.ValidationError("Este campo es obligatorio y no puede estar vacio.")
        return value.strip()

    def validate_factor_riesgo(self, value):
        if value is None or not value.strip():
            raise serializers.ValidationError("Este campo es obligatorio y no puede estar vacio.")
        return value.strip()
