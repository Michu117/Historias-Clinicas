from rest_framework import serializers

from .models import (
    Servicio, Cita, SignosVitales,
    ConsultaMedica, ConsultaOdontologica, ConsultaPsicologica,
    ConsultaSocial, Derivacion, Certificado
)


class ServicioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Servicio
        fields = ['id', 'nombre', 'descripcion', 'es_activo', 'fecha_creacion']
        read_only_fields = ['fecha_creacion']


class CitaSerializer(serializers.ModelSerializer):
    servicios = serializers.PrimaryKeyRelatedField(
        queryset=Servicio.objects.filter(activo=True),
        many=True,
        required=False,
        allow_empty=True,
    )

    class Meta:
        model = Cita
        fields = [
            'id', 'paciente_id', 'profesional_id', 'fecha_hora', 'estado',
            'motivo', 'servicios', 'fecha_creacion', 'fecha_actualizacion'
        ]
        read_only_fields = ['fecha_creacion', 'fecha_actualizacion']

    def validate_fecha_hora(self, value):
        from django.utils import timezone

        if value <= timezone.now():
            raise serializers.ValidationError('La fecha y hora de la cita debe ser futura.')
        return value


class SignosVitalesSerializer(serializers.ModelSerializer):
    class Meta:
        model = SignosVitales
        fields = ['id', 'peso_kg', 'temperatura', 'presion_arterial', 'frecuencia_cardiaca']

    def validate_peso_kg(self, value):
        if value <= 0:
            raise serializers.ValidationError('El peso debe ser mayor a cero.')
        return value

    def validate_temperatura(self, value):
        if value < 34 or value > 42:
            raise serializers.ValidationError('La temperatura debe estar entre 34 y 42 grados.')
        return value

    def validate_frecuencia_cardiaca(self, value):
        if value <= 0:
            raise serializers.ValidationError('La frecuencia cardíaca debe ser mayor a cero.')
        return value


class ConsultaMedicaSerializer(serializers.ModelSerializer):
    signos_vitales = SignosVitalesSerializer(required=False)
    servicios = ServicioSerializer(many=True, read_only=True)

    class Meta:
        model = ConsultaMedica
        fields = [
            'id', 'cita', 'anamnesis', 'tratamiento', 'diagnostico',
            'observaciones', 'signos_vitales', 'servicios', 'fecha_creacion'
        ]
        read_only_fields = ['fecha_creacion']


class ConsultaOdontologicaSerializer(serializers.ModelSerializer):
    servicios = ServicioSerializer(many=True, read_only=True)

    class Meta:
        model = ConsultaOdontologica
        fields = [
            'id', 'cita', 'odontograma', 'procedimientos',
            'observaciones', 'servicios', 'fecha_creacion'
        ]
        read_only_fields = ['fecha_creacion']


class ConsultaPsicologicaSerializer(serializers.ModelSerializer):
    servicios = ServicioSerializer(many=True, read_only=True)

    class Meta:
        model = ConsultaPsicologica
        fields = [
            'id', 'cita', 'notas_evolucion', 'estado_humor',
            'nivel_ansiedad', 'nivel_autoestima', 'diagnostico',
            'observaciones', 'servicios', 'fecha_creacion'
        ]
        read_only_fields = ['fecha_creacion']


class ConsultaSocialSerializer(serializers.ModelSerializer):
    servicios = ServicioSerializer(many=True, read_only=True)

    class Meta:
        model = ConsultaSocial
        fields = [
            'id', 'cita', 'nivel_socioeconomico',
            'descripcion_vivienda', 'observaciones', 'servicios', 'fecha_creacion'
        ]
        read_only_fields = ['fecha_creacion']


class DerivacionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Derivacion
        fields = ['id', 'paciente_id', 'remitente_id', 'destinatario', 'tipo', 'motivo', 'estado', 'fecha_creacion']
        read_only_fields = ['estado', 'fecha_creacion']


class CertificadoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Certificado
        fields = ['id', 'cita', 'tipo', 'archivo', 'fecha_emision']
        read_only_fields = ['fecha_emision']
