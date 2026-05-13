from rest_framework import serializers
from .models import Report


class ReportSerializer(serializers.ModelSerializer):
    class Meta:
        model = Report
        fields = ['id', 'title', 'data', 'created_at']
        read_only_fields = ['id', 'created_at']


class AtencionesStatsSerializer(serializers.Serializer):
    """Serializer para estadísticas de atenciones."""
    total_atenciones = serializers.IntegerField(read_only=True)
    por_tipo_servicio = serializers.ListField(
        child=serializers.DictField(),
        read_only=True
    )
    por_diagnostico = serializers.ListField(
        child=serializers.DictField(),
        read_only=True
    )
    filtros_aplicados = serializers.DictField(read_only=True)


class DiagnosticosFrecuentesSerializer(serializers.Serializer):
    """Serializer para diagnósticos frecuentes."""
    items = serializers.ListField(
        child=serializers.DictField(),
        read_only=True
    )
    total_registros = serializers.IntegerField(read_only=True)
    filtros_aplicados = serializers.DictField(read_only=True)


class ServiciosMasUsadosSerializer(serializers.Serializer):
    """Serializer para servicios más usados."""
    items = serializers.ListField(
        child=serializers.DictField(),
        read_only=True
    )
    total_registros = serializers.IntegerField(read_only=True)
    filtros_aplicados = serializers.DictField(read_only=True)


class DashboardMetricsSerializer(serializers.Serializer):
    """Serializer para métricas del dashboard."""
    institucional = serializers.DictField(read_only=True)
    servicios = serializers.ListField(read_only=True)
    diagnosticos = serializers.ListField(read_only=True)
    tendencias = serializers.DictField(read_only=True)
    filtros_aplicados = serializers.DictField(read_only=True)


class StandardResponseSerializer(serializers.Serializer):
    """Wrapper de respuesta estándar para todos los endpoints."""
    success = serializers.BooleanField()
    message = serializers.CharField()
    data = serializers.JSONField()
    errors = serializers.JSONField(required=False, allow_null=True)

