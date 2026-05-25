from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.response import Response
from rest_framework_simplejwt.authentication import JWTAuthentication
import logging

from .models import Reporte
from .serializers import ReporteSerializer
from django.apps import apps
from django.db.models import Q, Count
from datetime import datetime

AgendaConsultaMedica = apps.get_model('Agendas', 'ConsultaMedica')
AgendaConsultaPsicologica = apps.get_model('Agendas', 'ConsultaPsicologica')
AgendaConsultaOdontologica = apps.get_model('Agendas', 'ConsultaOdontologica')
AgendaConsultaSocial = apps.get_model('Agendas', 'ConsultaSocial')
AgendaCita = apps.get_model('Agendas', 'Cita')
AgendaServicio = apps.get_model('Agendas', 'Servicio')

def _parse_comma_list(param: str):
    return [s.strip() for s in param.split(',') if s.strip()] if param else None


def _get_atenciones_stats_local(fecha_inicio=None, fecha_fin=None, servicio_id=None):
    """Genera conteos reales por subtipo de consulta usando los modelos de Agendas.

    - fecha_inicio/fecha_fin: objetos date (opcionales). Si se pasan, se filtra por
      cita__fecha_hora__date entre ambos inclusive.
    - servicio_id: id del servicio (int) para filtrar solo citas que incluyan ese servicio.
    """
    try:
        # Construir Q de fecha
        q_fecha = Q()
        if fecha_inicio:
            q_fecha &= Q(cita__fecha_hora__date__gte=fecha_inicio)
        if fecha_fin:
            q_fecha &= Q(cita__fecha_hora__date__lte=fecha_fin)

        # Filtro por servicio (Cita tiene M2M 'servicios')
        q_serv = Q()
        if servicio_id:
            q_serv = Q(cita__servicios=servicio_id)

        # Preparar querysets para cada subtipo
        m_qs = AgendaConsultaMedica.objects.filter(q_fecha & q_serv).select_related('cita').prefetch_related('cita__servicios')
        p_qs = AgendaConsultaPsicologica.objects.filter(q_fecha & q_serv).select_related('cita').prefetch_related('cita__servicios')
        o_qs = AgendaConsultaOdontologica.objects.filter(q_fecha & q_serv).select_related('cita').prefetch_related('cita__servicios')
        s_qs = AgendaConsultaSocial.objects.filter(q_fecha & q_serv).select_related('cita').prefetch_related('cita__servicios')

        medica = m_qs.count()
        psicologica = p_qs.count()
        odontologica = o_qs.count()
        social = s_qs.count()

        total = medica + psicologica + odontologica + social

        por_tipo_servicio = [
            {"tipo": "medica", "cantidad": medica},
            {"tipo": "psicologica", "cantidad": psicologica},
            {"tipo": "odontologica", "cantidad": odontologica},
            {"tipo": "social", "cantidad": social},
        ]

        return {
            "total_atenciones": total,
            "por_tipo_servicio": por_tipo_servicio,
            "filtros_aplicados": {
                "fecha_inicio": fecha_inicio.isoformat() if fecha_inicio else None,
                "fecha_fin": fecha_fin.isoformat() if fecha_fin else None,
                "servicio_id": servicio_id,
            }
        }
    except Exception:
        logging.getLogger(__name__).exception("Error al generar atenciones reales")
        raise

def _get_diagnosticos_frecuentes_local(fecha_inicio=None, fecha_fin=None, servicio_id=None, limit=10):
    """Agrega y devuelve los diagnósticos más frecuentes basándose en los campos
    `diagnostico` de ConsultaMedica y ConsultaPsicologica.
    """
    try:
        q_fecha = Q()
        if fecha_inicio:
            q_fecha &= Q(cita__fecha_hora__date__gte=fecha_inicio)
        if fecha_fin:
            q_fecha &= Q(cita__fecha_hora__date__lte=fecha_fin)

        q_serv = Q()
        if servicio_id:
            q_serv = Q(cita__servicios=servicio_id)

        # Medica
        med_qs = AgendaConsultaMedica.objects.filter(q_fecha & q_serv).values('diagnostico')
        med_agg = med_qs.annotate(cantidad=Count('diagnostico')).order_by('-cantidad')

        # Psicologica
        psi_qs = AgendaConsultaPsicologica.objects.filter(q_fecha & q_serv).values('diagnostico')
        psi_agg = psi_qs.annotate(cantidad=Count('diagnostico')).order_by('-cantidad')

        # Combinar resultados en dict
        combined = {}
        for row in med_agg:
            key = (row['diagnostico'] or '').strip()
            if not key:
                continue
            combined.setdefault(key, 0)
            combined[key] += row['cantidad']
        for row in psi_agg:
            key = (row['diagnostico'] or '').strip()
            if not key:
                continue
            combined.setdefault(key, 0)
            combined[key] += row['cantidad']

        items = [
            {"codigo": k, "descripcion": k, "cantidad": v}
            for k, v in sorted(combined.items(), key=lambda x: x[1], reverse=True)[:limit]
        ]

        return {"items": items, "total_registros": sum(v for v in combined.values()), "filtros_aplicados": {"fecha_inicio": fecha_inicio.isoformat() if fecha_inicio else None, "fecha_fin": fecha_fin.isoformat() if fecha_fin else None, "servicio_id": servicio_id}}
    except Exception:
        logging.getLogger(__name__).exception("Error generando diagnósticos frecuentes")
        raise

def _get_servicios_mas_usados_local(fecha_inicio=None, fecha_fin=None, servicio_id=None, limit=10):
    """Cuenta servicios más usados a partir de las citas en el rango dado.
    Devuelve lista de servicios con su cantidad y porcentaje.
    """
    try:
        citas_q = AgendaCita.objects.all()
        if fecha_inicio:
            citas_q = citas_q.filter(fecha_hora__date__gte=fecha_inicio)
        if fecha_fin:
            citas_q = citas_q.filter(fecha_hora__date__lte=fecha_fin)
        if servicio_id:
            # Si se filtra por servicio, limitar las citas a las que tengan ese servicio
            citas_q = citas_q.filter(servicios=servicio_id)

        # Contar uso por servicio
        servicios_q = AgendaServicio.objects.filter(citas__in=citas_q).annotate(cantidad=Count('citas')).order_by('-cantidad')
        total = servicios_q.aggregate(total_sum=Count('citas'))['total_sum'] or 0

        items = []
        for s in servicios_q[:limit]:
            porcentaje = (s.cantidad / total * 100) if total else 0
            items.append({"servicio": s.nombre, "cantidad": s.cantidad, "porcentaje": round(porcentaje, 2)})

        return {"items": items, "total_registros": total, "filtros_aplicados": {"fecha_inicio": fecha_inicio.isoformat() if fecha_inicio else None, "fecha_fin": fecha_fin.isoformat() if fecha_fin else None, "servicio_id": servicio_id}}
    except Exception:
        logging.getLogger(__name__).exception("Error generando servicios más usados")
        raise

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
        # Parsear filtros desde query params
        fecha_inicio_param = request.query_params.get('fecha_inicio')
        fecha_fin_param = request.query_params.get('fecha_fin')
        servicio_param = request.query_params.get('servicio')

        fecha_inicio = None
        fecha_fin = None
        try:
            fecha_inicio = datetime.strptime(fecha_inicio_param, '%Y-%m-%d').date() if fecha_inicio_param else None
        except Exception:
            pass
        try:
            fecha_fin = datetime.strptime(fecha_fin_param, '%Y-%m-%d').date() if fecha_fin_param else None
        except Exception:
            pass

        servicio_id = int(servicio_param) if servicio_param and servicio_param.isdigit() else None

        # Llamar a la implementación real
        stats = _get_atenciones_stats_local(fecha_inicio=fecha_inicio, fecha_fin=fecha_fin, servicio_id=servicio_id)

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
        # Parsear filtros desde query params (fecha y servicio son los más relevantes)
        fecha_inicio_param = request.query_params.get('fecha_inicio')
        fecha_fin_param = request.query_params.get('fecha_fin')
        servicio_param = request.query_params.get('servicio')

        fecha_inicio = None
        fecha_fin = None
        try:
            fecha_inicio = datetime.strptime(fecha_inicio_param, '%Y-%m-%d').date() if fecha_inicio_param else None
        except Exception:
            pass
        try:
            fecha_fin = datetime.strptime(fecha_fin_param, '%Y-%m-%d').date() if fecha_fin_param else None
        except Exception:
            pass

        servicio_id = int(servicio_param) if servicio_param and servicio_param.isdigit() else None

        # Construir dashboard real combinando funciones reales
        try:
            atenciones = _get_atenciones_stats_local(fecha_inicio=fecha_inicio, fecha_fin=fecha_fin, servicio_id=servicio_id)
            servicios = _get_servicios_mas_usados_local(fecha_inicio=fecha_inicio, fecha_fin=fecha_fin, servicio_id=servicio_id)
            diagnosticos_freq = _get_diagnosticos_frecuentes_local(fecha_inicio=fecha_inicio, fecha_fin=fecha_fin, servicio_id=servicio_id)

            stats = {
                "institucional": {
                    "total_atenciones": atenciones["total_atenciones"],
                    "servicios_activos": len(servicios["items"]),
                    "diagnosticos_rastreados": len(diagnosticos_freq["items"]),
                },
                "servicios": servicios["items"],
                "diagnosticos": diagnosticos_freq["items"][:5],
                "tendencias": {
                    "mes_anterior": {"atenciones": 0, "crecimiento": "N/A"},
                    "mes_actual": {"atenciones": atenciones["total_atenciones"], "crecimiento": "N/A"},
                },
                "filtros_aplicados": {
                    "fecha_inicio": fecha_inicio.isoformat() if fecha_inicio else None,
                    "fecha_fin": fecha_fin.isoformat() if fecha_fin else None,
                    "servicio_id": servicio_id,
                },
            }
        except Exception as e:
            logger.exception("Error construyendo dashboard real: %s", e)
            raise

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
        fecha_inicio_param = request.query_params.get('fecha_inicio')
        fecha_fin_param = request.query_params.get('fecha_fin')
        servicio_param = request.query_params.get('servicio')

        fecha_inicio = None
        fecha_fin = None
        try:
            fecha_inicio = datetime.strptime(fecha_inicio_param, '%Y-%m-%d').date() if fecha_inicio_param else None
        except Exception:
            pass
        try:
            fecha_fin = datetime.strptime(fecha_fin_param, '%Y-%m-%d').date() if fecha_fin_param else None
        except Exception:
            pass

        servicio_id = int(servicio_param) if servicio_param and servicio_param.isdigit() else None

        stats = _get_diagnosticos_frecuentes_local(fecha_inicio=fecha_inicio, fecha_fin=fecha_fin, servicio_id=servicio_id)

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
        fecha_inicio_param = request.query_params.get('fecha_inicio')
        fecha_fin_param = request.query_params.get('fecha_fin')
        servicio_param = request.query_params.get('servicio')

        fecha_inicio = None
        fecha_fin = None
        try:
            fecha_inicio = datetime.strptime(fecha_inicio_param, '%Y-%m-%d').date() if fecha_inicio_param else None
        except Exception:
            pass
        try:
            fecha_fin = datetime.strptime(fecha_fin_param, '%Y-%m-%d').date() if fecha_fin_param else None
        except Exception:
            pass

        servicio_id = int(servicio_param) if servicio_param and servicio_param.isdigit() else None

        stats = _get_servicios_mas_usados_local(fecha_inicio=fecha_inicio, fecha_fin=fecha_fin, servicio_id=servicio_id)

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

