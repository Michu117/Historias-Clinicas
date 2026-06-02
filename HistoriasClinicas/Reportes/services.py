import json
import logging
from collections import defaultdict
from datetime import date, datetime

from django.apps import apps
from django.db.models import Q, Count

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

    def parse_filters(self, query_params):
        """Parsea filtros de query params y retorna tipos listos para consultas."""
        fecha_inicio_param = query_params.get('fecha_inicio')
        fecha_fin_param = query_params.get('fecha_fin')
        servicio_param = query_params.get('servicio')

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
        return fecha_inicio, fecha_fin, servicio_id

    def _filtros_aplicados(self, fecha_inicio=None, fecha_fin=None, servicio_id=None):
        return {
            'fecha_inicio': fecha_inicio.isoformat() if fecha_inicio else None,
            'fecha_fin': fecha_fin.isoformat() if fecha_fin else None,
            'servicio_id': servicio_id,
        }

    def _consulta_models(self):
        return {
            'medica': apps.get_model('Agendas', 'ConsultaMedica'),
            'psicologica': apps.get_model('Agendas', 'ConsultaPsicologica'),
            'odontologica': apps.get_model('Agendas', 'ConsultaOdontologica'),
            'social': apps.get_model('Agendas', 'ConsultaSocial'),
        }

    def _consulta_filters(self, fecha_inicio=None, fecha_fin=None, servicio_id=None):
        q_base = Q()
        if fecha_inicio:
            q_base &= Q(cita__fecha_hora__date__gte=fecha_inicio)
        if fecha_fin:
            q_base &= Q(cita__fecha_hora__date__lte=fecha_fin)
        if servicio_id:
            q_base &= Q(cita__servicios=servicio_id)
        return q_base

    def get_atenciones_stats(self, fecha_inicio=None, fecha_fin=None, servicio_id=None):
        """Retorna conteos de atenciones por tipo, serializable a JSON."""
        models = self._consulta_models()
        q_base = self._consulta_filters(fecha_inicio, fecha_fin, servicio_id)

        por_tipo = []
        total = 0
        for tipo, model in models.items():
            cantidad = model.objects.filter(q_base).count()
            por_tipo.append({'tipo': tipo, 'cantidad': cantidad})
            total += cantidad

        return {
            'total_atenciones': total,
            'por_tipo_servicio': por_tipo,
            'filtros_aplicados': self._filtros_aplicados(fecha_inicio, fecha_fin, servicio_id),
        }

    def get_diagnosticos_frecuentes(self, fecha_inicio=None, fecha_fin=None, servicio_id=None, limit=10):
        """Retorna top de diagnósticos más frecuentes para API."""
        ConsultaMedica = apps.get_model('Agendas', 'ConsultaMedica')
        ConsultaPsicologica = apps.get_model('Agendas', 'ConsultaPsicologica')
        q_base = self._consulta_filters(fecha_inicio, fecha_fin, servicio_id)

        med_agg = (
            ConsultaMedica.objects.filter(q_base)
            .values('diagnostico')
            .annotate(cantidad=Count('diagnostico'))
            .order_by('-cantidad')
        )
        psi_agg = (
            ConsultaPsicologica.objects.filter(q_base)
            .values('diagnostico')
            .annotate(cantidad=Count('diagnostico'))
            .order_by('-cantidad')
        )

        combinado = {}
        for row in list(med_agg) + list(psi_agg):
            diagnostico = (row['diagnostico'] or '').strip()
            if not diagnostico:
                continue
            combinado[diagnostico] = combinado.get(diagnostico, 0) + row['cantidad']

        items = [
            {'codigo': diag, 'descripcion': diag, 'cantidad': count}
            for diag, count in sorted(combinado.items(), key=lambda x: x[1], reverse=True)[:limit]
        ]

        return {
            'items': items,
            'total_registros': sum(combinado.values()),
            'filtros_aplicados': self._filtros_aplicados(fecha_inicio, fecha_fin, servicio_id),
        }

    def get_servicios_mas_usados(self, fecha_inicio=None, fecha_fin=None, servicio_id=None, limit=10):
        """Retorna servicios más usados con porcentaje para API."""
        Cita = apps.get_model('Agendas', 'Cita')
        Servicio = apps.get_model('Agendas', 'Servicio')

        citas_qs = Cita.objects.all()
        if fecha_inicio:
            citas_qs = citas_qs.filter(fecha_hora__date__gte=fecha_inicio)
        if fecha_fin:
            citas_qs = citas_qs.filter(fecha_hora__date__lte=fecha_fin)
        if servicio_id:
            citas_qs = citas_qs.filter(servicios=servicio_id)

        servicios_qs = (
            Servicio.objects.filter(citas__in=citas_qs)
            .annotate(cantidad=Count('citas'))
            .order_by('-cantidad')
        )
        total = servicios_qs.aggregate(total_sum=Count('citas'))['total_sum'] or 0

        items = []
        for servicio in servicios_qs[:limit]:
            porcentaje = round((servicio.cantidad / total) * 100, 2) if total else 0
            items.append({
                'servicio': servicio.nombre,
                'cantidad': servicio.cantidad,
                'porcentaje': porcentaje,
            })

        return {
            'items': items,
            'total_registros': total,
            'filtros_aplicados': self._filtros_aplicados(fecha_inicio, fecha_fin, servicio_id),
        }

    def get_consultas_por_genero(self, fecha_inicio=None, fecha_fin=None, servicio_id=None):
        """Retorna porcentaje de consultas separadas por género de usuario."""
        Usuario = apps.get_model('Seguridad', 'Usuario')
        q_base = self._consulta_filters(fecha_inicio, fecha_fin, servicio_id)

        consultas_por_usuario = defaultdict(int)
        for model in self._consulta_models().values():
            rows = (
                model.objects.filter(q_base)
                .values('cita__usuario_id')
                .annotate(cantidad=Count('id'))
            )
            for row in rows:
                usuario_id = row['cita__usuario_id']
                if usuario_id is not None:
                    consultas_por_usuario[usuario_id] += row['cantidad']

        if not consultas_por_usuario:
            return {
                'items': [],
                'total_registros': 0,
                'filtros_aplicados': self._filtros_aplicados(fecha_inicio, fecha_fin, servicio_id),
            }

        usuarios = Usuario.objects.filter(id__in=list(consultas_por_usuario.keys())).values('id', 'sexo')
        sexo_por_id = {u['id']: u['sexo'] for u in usuarios}

        acumulado = defaultdict(int)
        for usuario_id, cantidad in consultas_por_usuario.items():
            sexo = sexo_por_id.get(usuario_id)
            if sexo == 'H':
                acumulado['hombre'] += cantidad
            elif sexo == 'M':
                acumulado['mujer'] += cantidad
            else:
                acumulado['sin_registro'] += cantidad

        total = sum(acumulado.values())
        items = []
        for genero in ('hombre', 'mujer', 'sin_registro'):
            cantidad = acumulado.get(genero, 0)
            if cantidad == 0:
                continue
            porcentaje = round((cantidad / total) * 100, 2) if total else 0
            items.append({'genero': genero, 'cantidad': cantidad, 'porcentaje': porcentaje})

        return {
            'items': items,
            'total_registros': total,
            'filtros_aplicados': self._filtros_aplicados(fecha_inicio, fecha_fin, servicio_id),
        }

    def get_dashboard_metrics(self, fecha_inicio=None, fecha_fin=None, servicio_id=None):
        """Consolida el dashboard en un objeto serializable a JSON."""
        atenciones = self.get_atenciones_stats(fecha_inicio, fecha_fin, servicio_id)
        servicios = self.get_servicios_mas_usados(fecha_inicio, fecha_fin, servicio_id)
        diagnosticos = self.get_diagnosticos_frecuentes(fecha_inicio, fecha_fin, servicio_id)
        por_genero = self.get_consultas_por_genero(fecha_inicio, fecha_fin, servicio_id)

        return {
            'institucional': {
                'total_atenciones': atenciones['total_atenciones'],
                'servicios_activos': len(servicios['items']),
                'diagnosticos_rastreados': len(diagnosticos['items']),
            },
            'servicios': servicios['items'],
            'diagnosticos': diagnosticos['items'][:5],
            'consultas_por_genero': por_genero,
            'tendencias': {
                'mes_anterior': {'atenciones': 0, 'crecimiento': 'N/A'},
                'mes_actual': {'atenciones': atenciones['total_atenciones'], 'crecimiento': 'N/A'},
            },
            'filtros_aplicados': self._filtros_aplicados(fecha_inicio, fecha_fin, servicio_id),
        }

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
        service_type, _service_field = self._detect_cita_service_field(Cita)

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