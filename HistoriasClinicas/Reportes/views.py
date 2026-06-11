from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.response import Response
from rest_framework_simplejwt.authentication import JWTAuthentication
import logging

from .models import Reporte
from .serializers import ReporteSerializer
from .services import Services

report_service = Services()

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
    queryset = Reporte.objects.all()
    serializer_class = ReporteSerializer

    def perform_create(self, serializer):
        # Usar el serializer para crear el objeto Reporte directamente.
        serializer.save()


class ReportDetailAPIView(generics.RetrieveUpdateDestroyAPIView):
    """Endpoint para obtener, actualizar y eliminar un reporte."""
    authentication_classes = [JWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]
    queryset = Reporte.objects.all()
    serializer_class = ReporteSerializer

    def perform_update(self, serializer):
        # Actualizar usando el serializer
        serializer.save()

    def perform_destroy(self, instance):
        # Eliminar instancia
        instance.delete()


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
        fecha_inicio, fecha_fin, servicio_id = report_service.parse_filters(request.query_params)
        stats = report_service.get_atenciones_stats(fecha_inicio=fecha_inicio, fecha_fin=fecha_fin, servicio_id=servicio_id)

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
        fecha_inicio, fecha_fin, servicio_id = report_service.parse_filters(request.query_params)
        stats = report_service.get_dashboard_metrics(
            fecha_inicio=fecha_inicio,
            fecha_fin=fecha_fin,
            servicio_id=servicio_id,
        )

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
def consultas_por_genero_view(request):
    """
    GET /api/v1/reportes/consultas-por-genero/

    Endpoint para obtener porcentaje de consultas separadas por género.
    """
    try:
        fecha_inicio, fecha_fin, servicio_id = report_service.parse_filters(request.query_params)
        stats = report_service.get_consultas_por_genero(
            fecha_inicio=fecha_inicio,
            fecha_fin=fecha_fin,
            servicio_id=servicio_id,
        )

        return build_response(
            success=True,
            message="Consultas por género generadas correctamente",
            data=stats,
            status_code=status.HTTP_200_OK
        )
    except Exception as e:
        logger.error(f"Error en consultas_por_genero_view: {str(e)}")
        return build_response(
            success=False,
            message="Error al generar consultas por género",
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
        fecha_inicio, fecha_fin, servicio_id = report_service.parse_filters(request.query_params)
        stats = report_service.get_diagnosticos_frecuentes(
            fecha_inicio=fecha_inicio,
            fecha_fin=fecha_fin,
            servicio_id=servicio_id,
        )

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
        fecha_inicio, fecha_fin, servicio_id = report_service.parse_filters(request.query_params)
        stats = report_service.get_servicios_mas_usados(
            fecha_inicio=fecha_inicio,
            fecha_fin=fecha_fin,
            servicio_id=servicio_id,
        )

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

