from django.apps import apps
from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.response import Response
from rest_framework_simplejwt.authentication import JWTAuthentication
import logging

from .models import Reporte
from .serializers import ReporteSerializer
from .services import Services
from .services import Services as ReportServices
import io
from django.http import HttpResponse
import json

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
    authentication_classes = []
    permission_classes = [permissions.AllowAny]
    queryset = Reporte.objects.all()
    serializer_class = ReporteSerializer

    def perform_create(self, serializer):
        # Usar el serializer para crear el objeto Reporte directamente.
        serializer.save()


class ReportDetailAPIView(generics.RetrieveUpdateDestroyAPIView):
    """Endpoint para obtener, actualizar y eliminar un reporte."""
    authentication_classes = []
    permission_classes = [permissions.AllowAny]
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
@authentication_classes([])
@permission_classes([permissions.AllowAny])
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
@authentication_classes([])
@permission_classes([permissions.AllowAny])
def estadisticas_view(request):
    """
    GET /api/v1/reportes/estadisticas/

    Retorna una lista simple con el total de consultas por servicio.
    """
    try:
        fecha_inicio, fecha_fin, servicio_id = report_service.parse_filters(request.query_params)
        stats = report_service.get_atenciones_stats(
            fecha_inicio=fecha_inicio,
            fecha_fin=fecha_fin,
            servicio_id=servicio_id,
        )
        result = [
            {"servicio": item["tipo"], "total": item["cantidad"]}
            for item in stats["por_tipo_servicio"]
        ]
        return Response(result, status=status.HTTP_200_OK)
    except Exception as e:
        logger.error(f"Error en estadisticas_view: {str(e)}")
        return Response(
            {"error": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@authentication_classes([])
@permission_classes([permissions.AllowAny])
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
@authentication_classes([])
@permission_classes([permissions.AllowAny])
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
@authentication_classes([])
@permission_classes([permissions.AllowAny])
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


@api_view(['GET'])
@authentication_classes([])
@permission_classes([permissions.AllowAny])
def servicios_catalogo_view(request):
    """
    GET /api/v1/reportes/servicios-catalogo/

    Retorna el catálogo de servicios activos para poblar selectores del frontend.
    """
    try:
        Servicio = apps.get_model('Agendas', 'Servicio')
        servicios = Servicio.objects.filter(es_activo=True).values('id', 'nombre').order_by('nombre')
        data = [{'value': str(s['id']), 'label': s['nombre']} for s in servicios]
        data.insert(0, {'value': '', 'label': 'Todos'})
        return build_response(
            success=True,
            message='Catálogo de servicios obtenido correctamente',
            data=data,
            status_code=status.HTTP_200_OK
        )
    except Exception as e:
        logger.error(f"Error en servicios_catalogo_view: {str(e)}")
        return build_response(
            success=False,
            message='Error al obtener catálogo de servicios',
            errors={"detail": str(e)},
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@authentication_classes([])
@permission_classes([permissions.AllowAny])
def consultas_rango_view(request):
    """
    GET /api/v1/reportes/consultas-rango/

    Endpoint para obtener distribución de consultas por fecha en un rango.
    Retorna todas las fechas del rango (incluso sin registros) para gráficas.

    Query params:
    - fecha_inicio: YYYY-MM-DD (opcional, default: 30 días atrás)
    - fecha_fin: YYYY-MM-DD (opcional, default: hoy)
    - servicio: id del servicio (opcional)
    """
    try:
        fecha_inicio, fecha_fin, servicio_id = report_service.parse_filters(request.query_params)
        stats = report_service.get_consultas_rango(
            fecha_inicio=fecha_inicio,
            fecha_fin=fecha_fin,
            servicio_id=servicio_id,
        )

        return build_response(
            success=True,
            message="Consultas por rango generadas correctamente",
            data=stats,
            status_code=status.HTTP_200_OK
        )
    except ValueError as e:
        return build_response(
            success=False,
            message=str(e),
            status_code=status.HTTP_400_BAD_REQUEST
        )
    except Exception as e:
        logger.error(f"Error en consultas_rango_view: {str(e)}")
        return build_response(
            success=False,
            message="Error al generar consultas por rango",
            errors={"detail": str(e)},
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@authentication_classes([])
@permission_classes([permissions.AllowAny])
def export_view(request):
    """
    POST /api/v1/reportes/export/

    Body JSON expected:
    {
      "format": "csv" | "pdf",
      "tipo": "generales" | "servicio" | "genero" | "diagnosticos",
      "fecha_inicio": "YYYY-MM-DD",
      "fecha_fin": "YYYY-MM-DD",
      "servicio": "1"  # opcional
    }
    """
    try:
        # Autenticación desactivada temporalmente para pruebas locales.
        # Cuando se reactive JWT, volver a validar request.user e is_staff/is_superuser.
        user = request.user if request.user and request.user.is_authenticated else None

        payload = request.data or {}
        fmt = (payload.get('format') or payload.get('fmt') or '').lower()
        if not fmt:
            return build_response(False, 'Missing format (csv or pdf)', status_code=status.HTTP_400_BAD_REQUEST)
        if fmt not in ('csv', 'pdf'):
            return build_response(False, 'Invalid format. Allowed: csv, pdf', status_code=status.HTTP_400_BAD_REQUEST)

        # Delegar en el servicio
        rs = ReportServices()
        res = rs.export_report(payload, user)

        if not res.get('success'):
            # error o no hay registros
            return build_response(False, res.get('message', 'No data to export'), status_code=status.HTTP_400_BAD_REQUEST)

        # Respuesta con archivo
        content = res.get('content')
        filename = res.get('filename', 'reporte')
        content_type = res.get('content_type')

        if not content:
            return build_response(False, 'No data to export', status_code=status.HTTP_400_BAD_REQUEST)

        response = HttpResponse(content, content_type=content_type)
        response['Content-Disposition'] = f'attachment; filename="{filename}"'
        return response
    except Exception as e:
        logger.exception('Error en export_view: %s', e)
        return build_response(False, 'Error interno al generar exportación', errors={'detail': str(e)}, status_code=status.HTTP_500_INTERNAL_SERVER_ERROR)


