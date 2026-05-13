from typing import List, Optional, Dict, Any
from .models import Report
from django.shortcuts import get_object_or_404
from django.db.models import Count, Q, Value
from django.db.models.functions import Coalesce
import logging

logger = logging.getLogger(__name__)


def list_reports() -> List[Report]:
    """Listar todos los reportes disponibles."""
    return list(Report.objects.all())


def get_report(pk: int) -> Report:
    """Obtener un reporte específico por ID."""
    return get_object_or_404(Report, pk=pk)


def create_report(data: dict) -> Report:
    """Crear un nuevo reporte."""
    report = Report.objects.create(title=data.get('title', ''), data=data.get('data', {}))
    logger.info(f"Reporte creado: {report.id} - {report.title}")
    return report


def update_report(pk: int, data: dict) -> Report:
    """Actualizar un reporte existente."""
    report = get_report(pk)
    report.title = data.get('title', report.title)
    report.data = data.get('data', report.data)
    report.save()
    logger.info(f"Reporte actualizado: {report.id}")
    return report


def delete_report(pk: int) -> None:
    """Eliminar un reporte."""
    report = get_report(pk)
    report.delete()
    logger.info(f"Reporte eliminado: {pk}")


# ============= Funciones Estadísticas para RF-11 =============


def normalize_filters(tipos_servicio: Optional[List[str]] = None, 
                     diagnosticos: Optional[List[str]] = None) -> Dict[str, List[str]]:
    """
    Normalizar filtros de entrada desde query params.
    
    :param tipos_servicio: lista de códigos de servicio (p.ej. ['medicina', 'odontologia'])
    :param diagnosticos: lista de códigos de diagnóstico (p.ej. ['J00', 'I10'])
    :return: diccionario con filtros normalizados
    """
    normalized = {
        'tipos_servicio': tipos_servicio or [],
        'diagnosticos': diagnosticos or []
    }
    logger.debug(f"Filtros normalizados: {normalized}")
    return normalized


def get_atenciones_stats(tipos_servicio: Optional[List[str]] = None,
                         diagnosticos: Optional[List[str]] = None) -> Dict[str, Any]:
    """
    Generar estadísticas de atenciones atendidas para RF-11.
    
    NOTA: Esta función está diseñada para consumir datos desde:
    - historias_clinicas.services.get_atenciones_reportables(filters)
    - agendas.services.get_agenda_context_reportes(filters)
    
    En esta versión MVP, usa el modelo Report como fuente simulada.
    
    :param tipos_servicio: filtro opcional por tipos de servicio
    :param diagnosticos: filtro opcional por diagnósticos
    :return: diccionario con métricas agregadas
    """
    filters = normalize_filters(tipos_servicio, diagnosticos)
    
    # En MVP, simular atenciones desde el JSON data del modelo Report
    # En production, estos datos vendrían desde Historias Clínicas
    try:
        total_atenciones = Report.objects.count()
        
        # Simulación de agregaciones por tipo de servicio
        por_tipo_servicio = [
            {"servicio": "medicina", "cantidad": max(0, total_atenciones // 2)},
            {"servicio": "odontologia", "cantidad": max(0, total_atenciones - (total_atenciones // 2))},
        ]
        
        # Simulación de agregaciones por diagnóstico
        por_diagnostico = [
            {"diagnostico": "J00", "cantidad": max(0, total_atenciones // 3)},
            {"diagnostico": "I10", "cantidad": max(0, (total_atenciones * 2) // 3)},
        ]
        
        result = {
            "total_atenciones": total_atenciones,
            "por_tipo_servicio": por_tipo_servicio,
            "por_diagnostico": por_diagnostico,
            "filtros_aplicados": filters,
        }
        logger.info(f"Estadísticas de atenciones generadas: total={total_atenciones}")
        return result
    except Exception as e:
        logger.error(f"Error al generar estadísticas de atenciones: {str(e)}")
        raise


def get_diagnosticos_frecuentes(tipos_servicio: Optional[List[str]] = None,
                               diagnosticos: Optional[List[str]] = None) -> Dict[str, Any]:
    """
    Generar ranking de diagnósticos más frecuentes.
    
    :param tipos_servicio: filtro opcional
    :param diagnosticos: filtro opcional
    :return: diccionario con diagnósticos frecuentes
    """
    filters = normalize_filters(tipos_servicio, diagnosticos)
    
    try:
        # Simulación de diagnósticos frecuentes
        items = [
            {"codigo": "J00", "descripcion": "Nasofaringitis aguda (resfriado común)", "cantidad": 45},
            {"codigo": "I10", "descripcion": "Hipertensión esencial (primaria)", "cantidad": 32},
            {"codigo": "E11", "descripcion": "Diabetes mellitus tipo 2", "cantidad": 28},
        ]
        
        result = {
            "items": items,
            "total_registros": sum(item['cantidad'] for item in items),
            "filtros_aplicados": filters,
        }
        logger.info(f"Diagnósticos frecuentes generados: {len(items)} items")
        return result
    except Exception as e:
        logger.error(f"Error al generar diagnósticos frecuentes: {str(e)}")
        raise


def get_servicios_mas_usados(tipos_servicio: Optional[List[str]] = None,
                             diagnosticos: Optional[List[str]] = None) -> Dict[str, Any]:
    """
    Generar estadísticas de servicios más utilizados.
    
    :param tipos_servicio: filtro opcional
    :param diagnosticos: filtro opcional
    :return: diccionario con servicios más usados
    """
    filters = normalize_filters(tipos_servicio, diagnosticos)
    
    try:
        total = 150
        items = [
            {"servicio": "medicina", "cantidad": 95, "porcentaje": 63.3},
            {"servicio": "odontologia", "cantidad": 40, "porcentaje": 26.7},
            {"servicio": "laboratorio", "cantidad": 15, "porcentaje": 10.0},
        ]
        
        result = {
            "items": items,
            "total_registros": total,
            "filtros_aplicados": filters,
        }
        logger.info(f"Servicios más usados generados: {len(items)} servicios")
        return result
    except Exception as e:
        logger.error(f"Error al generar servicios más usados: {str(e)}")
        raise


def get_dashboard_metrics(tipos_servicio: Optional[List[str]] = None,
                         diagnosticos: Optional[List[str]] = None) -> Dict[str, Any]:
    """
    Generar métricas consolidadas de dashboard para vista institucional.
    
    Combina:
    - Estadísticas institucionales
    - Métricas por servicio
    - Análisis de diagnósticos
    - Tendencias opcionales
    
    :param tipos_servicio: filtro opcional
    :param diagnosticos: filtro opcional
    :return: diccionario con métricas del dashboard
    """
    filters = normalize_filters(tipos_servicio, diagnosticos)
    
    try:
        atenciones = get_atenciones_stats(tipos_servicio, diagnosticos)
        servicios = get_servicios_mas_usados(tipos_servicio, diagnosticos)
        diagnosticos_freq = get_diagnosticos_frecuentes(tipos_servicio, diagnosticos)
        
        result = {
            "institucional": {
                "total_atenciones": atenciones["total_atenciones"],
                "servicios_activos": len(servicios["items"]),
                "diagnosticos_rastreados": len(diagnosticos_freq["items"]),
            },
            "servicios": servicios["items"],
            "diagnosticos": diagnosticos_freq["items"][:5],  # Top 5
            "tendencias": {
                "mes_anterior": {"atenciones": 120, "crecimiento": "12.5%"},
                "mes_actual": {"atenciones": atenciones["total_atenciones"], "crecimiento": "N/A"},
            },
            "filtros_aplicados": filters,
        }
        logger.info(f"Métricas del dashboard generadas exitosamente")
        return result
    except Exception as e:
        logger.error(f"Error al generar métricas del dashboard: {str(e)}")
        raise

