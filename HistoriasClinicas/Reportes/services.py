import json
import logging
from datetime import date
from typing import Dict, Any

from django.apps import apps
from django.db.models import Q

logger = logging.getLogger(__name__)

class Services:
    """
    Clase de servicio para generar datos del modelo Reporte.
    Método público:
      - generar_datos(reporte: Reporte) -> str (JSON)
    """

    def _detect_cita_service_field(self, CitaModel):
        """
        Detecta si Cita tiene un FK llamado 'servicio' o un M2M llamado 'servicios'.
        Devuelve una tupla (tipo, nombre_campo) donde tipo es 'fk' o 'm2m'.
        """
        try:
            CitaModel._meta.get_field('servicio')
            return ('fk', 'servicio')
        except Exception:
            pass

        try:
            CitaModel._meta.get_field('servicios')
            return ('m2m', 'servicios')
        except Exception:
            pass

        # Ninguno encontrado
        return (None, None)

    def generar_datos(self, reporte) -> str:
        """
        Genera los datos del reporte (JSON string) con la siguiente salida:
        {
          "total_consultas": int,
          "detalle": {
            "medica": int,
            "psicologica": int,
            "odontologica": int,
            "social": int
          },
          "filtros": {
            "fecha_inicio": "...",
            "fecha_fin": "...",
            "servicio": null | servicio_id_or_nombre
          }
        }

        - Filtra por fecha entre reporte.fecha_inicio y reporte.fecha_fin (usando fecha_creacion de las consultas).
        - Si reporte.servicio no es None, filtra por ese servicio.
        - Usa select_related('cita__servicio') si existe FK para mejorar rendimiento; si es M2M usa prefetch_related.
        """
        try:
            # Obtener modelos concretos
            Cita = apps.get_model('Agendas', 'Cita')
            # Los modelos de consulta concretos
            ConsultaMedica = apps.get_model('Agendas', 'ConsultaMedica')
            ConsultaPsicologica = apps.get_model('Agendas', 'ConsultaPsicologica')
            ConsultaOdontologica = apps.get_model('Agendas', 'ConsultaOdontologica')
            ConsultaSocial = apps.get_model('Agendas', 'ConsultaSocial')
        except LookupError as e:
            logger.exception("No se pudieron cargar los modelos de Agendas: %s", e)
            raise

        # Determinar cómo filtrar por servicio según definición de Cita
        service_type, service_field = self._detect_cita_service_field(Cita)

        # Rango de fechas (son DateField en Reporte)
        fecha_inicio = reporte.fecha_inicio
        fecha_fin = reporte.fecha_fin

        # Base Q para fechas: usamos fecha_creacion (DateTimeField) de las consultas comparando por date
        fecha_q = Q(fecha_creacion__date__gte=fecha_inicio) & Q(fecha_creacion__date__lte=fecha_fin)

        # Base Q para servicio (vacío si reporte.servicio is None)
        service_q = Q()
        if reporte.servicio:
            if service_type == 'fk':
                # Cita tiene FK 'servicio'
                service_q &= Q(cita__servicio=reporte.servicio)
            elif service_type == 'm2m':
                # Cita tiene M2M 'servicios'
                service_q &= Q(cita__servicios=reporte.servicio)
            else:
                # Si no hay campo conocido, no filtramos por servicio (o podrías elegir lanzar error)
                logger.warning("Cita no tiene ni 'servicio' ni 'servicios'; no se aplicará filtro por servicio.")
        # Combine fecha + servicio
        base_q = fecha_q & service_q

        # Para eficiencia: decide select_related/prefetch según tipo
        use_select_related = (service_type == 'fk')
        select_related_args = []
        prefetch_related_args = []
        if use_select_related:
            # Queremos traer la cita y su servicio en la misma consulta
            select_related_args.append('cita__servicio')
            select_related_args.append('cita')
        else:
            # Al menos traer la cita; si M2M, prefetch los servicios de la cita
            select_related_args.append('cita')
            if service_type == 'm2m':
                prefetch_related_args.append('cita__servicios')

        # Ejecutar conteos por cada subtipo
        qs_kwargs = {}
        # Contadores por subtipo
        medica_count = ConsultaMedica.objects.filter(base_q)
        psicologica_count = ConsultaPsicologica.objects.filter(base_q)
        odontologica_count = ConsultaOdontologica.objects.filter(base_q)
        social_count = ConsultaSocial.objects.filter(base_q)

        if select_related_args:
            medica_count = medica_count.select_related(*select_related_args)
            psicologica_count = psicologica_count.select_related(*select_related_args)
            odontologica_count = odontologica_count.select_related(*select_related_args)
            social_count = social_count.select_related(*select_related_args)

        if prefetch_related_args:
            medica_count = medica_count.prefetch_related(*prefetch_related_args)
            psicologica_count = psicologica_count.prefetch_related(*prefetch_related_args)
            odontologica_count = odontologica_count.prefetch_related(*prefetch_related_args)
            social_count = social_count.prefetch_related(*prefetch_related_args)

        # Obtener los conteos (evaluar las queries)
        medica = medica_count.count()
        psicologica = psicologica_count.count()
        odontologica = odontologica_count.count()
        social = social_count.count()

        total = medica + psicologica + odontologica + social

        result = {
            "total_consultas": total,
            "detalle": {
                "medica": medica,
                "psicologica": psicologica,
                "odontologica": odontologica,
                "social": social,
            },
            "filtros": {
                "fecha_inicio": fecha_inicio.isoformat() if isinstance(fecha_inicio, date) else str(fecha_inicio),
                "fecha_fin": fecha_fin.isoformat() if isinstance(fecha_fin, date) else str(fecha_fin),
                "servicio": getattr(reporte.servicio, 'id', None) if reporte.servicio else None,
            },
        }

        # Retornar JSON (string)
        return json.dumps(result, ensure_ascii=False)