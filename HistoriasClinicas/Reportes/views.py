from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.response import Response
from rest_framework_simplejwt.authentication import JWTAuthentication
import logging

from .models import Report
from .serializers import (
    ReportSerializer,
    AtencionesStatsSerializer,
    DiagnosticosFrecuentesSerializer,
    ServiciosMasUsadosSerializer,
    DashboardMetricsSerializer,
)
from .services import (
    list_reports,
    get_report,
    create_report,
    update_report,
    delete_report,
    get_atenciones_stats,
    get_diagnosticos_frecuentes,
    get_servicios_mas_usados,
    get_dashboard_metrics,
)

logger = logging.getLogger(__name__)


def build_response(success: bool, message: str, data = None, errors = None, status_code = 200):
    """Construir respuesta estándar JSON."""
    response_data = {
        "success": success,
        "message": message,
    }
    if data is not None:
        response_data["data"] = data
    if errors is not None:
        response_data["errors"] = errors
    return Response(response_data, status=status_code)


# ============= CRUD básico (herencia de GenericAPIView) =============

class ReportListCreateAPIView(generics.ListCreateAPIView):
    """Endpoint para listar y crear reportes."""
    authentication_classes = [JWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]
    queryset = Report.objects.all()
    serializer_class = ReportSerializer

    def perform_create(self, serializer):
        create_report({'title': serializer.validated_data.get('title', ''), 'data': serializer.validated_data.get('data', {})})


class ReportDetailAPIView(generics.RetrieveUpdateDestroyAPIView):
    """Endpoint para obtener, actualizar y eliminar un reporte."""
    authentication_classes = [JWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]
    queryset = Report.objects.all()
    serializer_class = ReportSerializer

    def perform_update(self, serializer):
        update_report(self.get_object().pk, serializer.validated_data)

    def perform_destroy(self, instance):
        delete_report(instance.pk)


# ============= Endpoints de estadísticas =============

@api_view(['GET'])
@authentication_classes([JWTAuthentication])
@permission_classes([permissions.IsAuthenticated])
def atenciones_stats_view(request):
    """
    GET /api/v1/reportes/atenciones/

    Endpoint para obtener estadísticas de atenciones atendidas (RF-11).

    Query params:
    - tipos_servicio: comma-separated (p.ej. "medicina,odontologia")
    - diagnosticos: comma-separated (p.ej. "J00,I10")
    """
    try:
        # Parsear filtros desde query params
        tipos_servicio_param = request.query_params.get('tipos_servicio', '')
        diagnosticos_param = request.query_params.get('diagnosticos', '')

        tipos_servicio = [s.strip() for s in tipos_servicio_param.split(',') if s.strip()] if tipos_servicio_param else None
        diagnosticos = [d.strip() for d in diagnosticos_param.split(',') if d.strip()] if diagnosticos_param else None

        # Llamar al servicio
        stats = get_atenciones_stats(tipos_servicio, diagnosticos)

        logger.info(f"Endpoint atenciones_stats: usuario={request.user}, filtros_aplicados=True")

        return build_response(
            success=True,
            message="Reporte de atenciones generado correctamente",
            data=stats,
            status_code=status.HTTP_200_OK
        )
    except Exception as e:
        logger.error(f"Error en atenciones_stats_view: {str(e)}")
        return build_response(
            success=False,
            message="Error al generar reporte de atenciones",
            errors={"detail": str(e)},
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@authentication_classes([JWTAuthentication])
@permission_classes([permissions.IsAuthenticated])
def estadisticas_view(request):
    """
    GET /api/v1/reportes/estadisticas/

    Endpoint para obtener estadísticas institucionales (RF-11).
    Combina métricas de servicios, diagnósticos y tendencias.

    Query params:
    - tipos_servicio: comma-separated
    - diagnosticos: comma-separated
    """
    try:
        # Parsear filtros desde query params
        tipos_servicio_param = request.query_params.get('tipos_servicio', '')
        diagnosticos_param = request.query_params.get('diagnosticos', '')

        tipos_servicio = [s.strip() for s in tipos_servicio_param.split(',') if s.strip()] if tipos_servicio_param else None
        diagnosticos = [d.strip() for d in diagnosticos_param.split(',') if d.strip()] if diagnosticos_param else None

        # Llamar al servicio de dashboard
        stats = get_dashboard_metrics(tipos_servicio, diagnosticos)

        logger.info(f"Endpoint estadisticas: usuario={request.user}, filtros_aplicados=True")

        return build_response(
            success=True,
            message="Estadísticas generadas correctamente",
            data=stats,
            status_code=status.HTTP_200_OK
        )
    except Exception as e:
        logger.error(f"Error en estadisticas_view: {str(e)}")
        return build_response(
            success=False,
            message="Error al generar estadísticas",
            errors={"detail": str(e)},
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@authentication_classes([JWTAuthentication])
@permission_classes([permissions.IsAuthenticated])
def diagnosticos_frecuentes_view(request):
    """
    GET /api/v1/reportes/diagnosticos-frecuentes/

    Endpoint para obtener diagnósticos más frecuentes.
    """
    try:
        tipos_servicio_param = request.query_params.get('tipos_servicio', '')
        diagnosticos_param = request.query_params.get('diagnosticos', '')

        tipos_servicio = [s.strip() for s in tipos_servicio_param.split(',') if s.strip()] if tipos_servicio_param else None
        diagnosticos = [d.strip() for d in diagnosticos_param.split(',') if d.strip()] if diagnosticos_param else None

        stats = get_diagnosticos_frecuentes(tipos_servicio, diagnosticos)

        return build_response(
            success=True,
            message="Diagnósticos frecuentes generados correctamente",
            data=stats,
            status_code=status.HTTP_200_OK
        )
    except Exception as e:
        logger.error(f"Error en diagnosticos_frecuentes_view: {str(e)}")
        return build_response(
            success=False,
            message="Error al generar diagnósticos frecuentes",
            errors={"detail": str(e)},
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@authentication_classes([JWTAuthentication])
@permission_classes([permissions.IsAuthenticated])
def servicios_mas_usados_view(request):
    """
    GET /api/v1/reportes/servicios-mas-usados/

    Endpoint para obtener servicios más utilizados.
    """
    try:
        tipos_servicio_param = request.query_params.get('tipos_servicio', '')
        diagnosticos_param = request.query_params.get('diagnosticos', '')

        tipos_servicio = [s.strip() for s in tipos_servicio_param.split(',') if s.strip()] if tipos_servicio_param else None
        diagnosticos = [d.strip() for d in diagnosticos_param.split(',') if d.strip()] if diagnosticos_param else None

        stats = get_servicios_mas_usados(tipos_servicio, diagnosticos)

        return build_response(
            success=True,
            message="Servicios más usados generados correctamente",
            data=stats,
            status_code=status.HTTP_200_OK
        )
    except Exception as e:
        logger.error(f"Error en servicios_mas_usados_view: {str(e)}")
        return build_response(
            success=False,
            message="Error al generar servicios más usados",
            errors={"detail": str(e)},
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

