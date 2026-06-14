import json
import logging
from collections import defaultdict
from datetime import date, datetime, time

from django.apps import apps
from django.db.models import Q, Count
import csv
import io

from django.db.models.functions import TruncDay
from django.utils import timezone

# ReportLab para generación de PDF
try:
    from reportlab.lib.pagesizes import A4
    from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
    from reportlab.lib import colors
    from reportlab.lib.styles import getSampleStyleSheet
except Exception as e:
    A4 = None
logger = logging.getLogger(__name__)

class Services:
    """
    Clase de servicio para generar datos del modelo Reporte.
    Método público:
      - generar_datos(reporte: Reporte) -> str (JSON)
    """

    def _detect_cita_service_field(self, CitaModel):
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

        return (None, None)

    def parse_filters(self, query_params):
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
            # Convertimos inicio a las 00:00:00 del día
            inicio_dt = datetime.combine(fecha_inicio, time.min)
            q_base &= Q(cita__fecha_hora__gte=inicio_dt)
        if fecha_fin:
            # Convertimos fin a las 23:59:59 del día
            fin_dt = datetime.combine(fecha_fin, time.max)
            q_base &= Q(cita__fecha_hora__lte=fin_dt)

        if servicio_id:
            q_base &= Q(cita__servicios=servicio_id)
        return q_base

    def get_atenciones_stats(self, fecha_inicio=None, fecha_fin=None, servicio_id=None):
        models = self._consulta_models()
        q_base = self._consulta_filters(fecha_inicio, fecha_fin, servicio_id)
        print(f"DEBUG FILTRO: {q_base}")
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

    def get_consultas_por_dia(self, fecha_inicio=None, fecha_fin=None, servicio_id=None):
        """Retorna la distribución de consultas por fecha real mapeada a días de la semana."""
        q_base = self._consulta_filters(fecha_inicio, fecha_fin, servicio_id)
        consulta_models = self._consulta_models()

        desglose_por_fecha = defaultdict(lambda: {'medica': 0, 'psicologica': 0, 'odontologica': 0, 'social': 0})

        for tipo, model in consulta_models.items():
            atenciones_qs = (
                model.objects.filter(q_base)
                .annotate(fecha=TruncDay('cita__fecha_hora'))
                .values('fecha')
                .annotate(cantidad=Count('id'))
                .order_by('fecha')
            )

            for entry in atenciones_qs:
                fecha = entry['fecha']
                if fecha:
                    # Nos aseguramos de extraer solo la parte de la fecha (date) por si viene con timezone
                    fecha_key = fecha.date() if hasattr(fecha, 'date') else fecha
                    desglose_por_fecha[fecha_key][tipo] += entry['cantidad']

        dias_semana_fijos = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']
        days_results = {dia: {'medica': 0, 'psicologica': 0, 'odontologica': 0, 'social': 0} for dia in dias_semana_fijos}

        dias_map_es = {
            'Monday': 'Lunes', 'Tuesday': 'Martes', 'Wednesday': 'Miércoles',
            'Thursday': 'Jueves', 'Friday': 'Viernes', 'Saturday': 'Sábado', 'Sunday': 'Domingo'
        }

        for fecha, conteos in desglose_por_fecha.items():
            dia_ingles = fecha.strftime('%A')
            dia_espanol = dias_map_es.get(dia_ingles, 'Lunes')

            days_results[dia_espanol]['medica'] += conteos['medica']
            days_results[dia_espanol]['psicologica'] += conteos['psicologica']
            days_results[dia_espanol]['odontologica'] += conteos['odontologica']
            days_results[dia_espanol]['social'] += conteos['social']

        final_days = []
        for dia in dias_semana_fijos:
            res = days_results[dia]
            final_days.append({
                'day': dia,
                'medica': res['medica'],
                'psicologica': res['psicologica'],
                'odontologica': res['odontologica'],
                'social': res['social']
            })

        return final_days

    def get_consultas_rango(self, fecha_inicio=None, fecha_fin=None, servicio_id=None):
        """
        Retorna la distribución de consultas por fecha en un rango.
        Asegura que todas las fechas en el rango estén presentes (incluso con 0 consultas).
        """
        from datetime import timedelta

        models = self._consulta_models()
        q_base = self._consulta_filters(fecha_inicio, fecha_fin, servicio_id)

        today = timezone.now().date()
        if not fecha_inicio and not fecha_fin:
            fecha_fin = today
            fecha_inicio = fecha_fin - timedelta(days=30)
        elif not fecha_inicio:
            fecha_inicio = fecha_fin - timedelta(days=30)
        elif not fecha_fin:
            fecha_fin = fecha_inicio + timedelta(days=30)

        if fecha_inicio > fecha_fin:
            raise ValueError("fecha_inicio no puede ser posterior a fecha_fin")

        desglose = {}
        current = fecha_inicio
        while current <= fecha_fin:
            desglose[current] = {'medica': 0, 'psicologica': 0, 'odontologica': 0, 'social': 0, 'total': 0}
            current += timedelta(days=1)

        for tipo, model in models.items():
            atenciones_qs = (
                model.objects.filter(q_base)
                .annotate(fecha=TruncDay('cita__fecha_hora'))
                .values('fecha')
                .annotate(cantidad=Count('id'))
                .order_by('fecha')
            )

            for entry in atenciones_qs:
                fecha_val = entry['fecha']
                if fecha_val:
                    fecha_key = fecha_val.date() if hasattr(fecha_val, 'date') else fecha_val
                    if fecha_key in desglose:
                        desglose[fecha_key][tipo] += entry['cantidad']
                        desglose[fecha_key]['total'] += entry['cantidad']

        items = []
        for fecha in sorted(desglose.keys()):
            items.append({
                'fecha': fecha.isoformat(),
                'medica': desglose[fecha]['medica'],
                'psicologica': desglose[fecha]['psicologica'],
                'odontologica': desglose[fecha]['odontologica'],
                'social': desglose[fecha]['social'],
                'total': desglose[fecha]['total'],
            })

        total_consultas = sum(item['total'] for item in items)

        return {
            'items': items,
            'total_consultas': total_consultas,
            'total_dias': len(items),
            'filtros_aplicados': self._filtros_aplicados(fecha_inicio, fecha_fin, servicio_id),
        }

    def get_kpis_dinamicos(self, fecha_inicio=None, fecha_fin=None, servicio_id=None):
        stats_atenciones = self.get_atenciones_stats(fecha_inicio, fecha_fin, servicio_id)
        total_atenciones = stats_atenciones['total_atenciones']

        metrics = [
            {
                'label': 'Consultas Totales',
                'value': total_atenciones,
                'trend': 'up',
                'delta': 12
            }
        ]

        stats_servicios = self.get_servicios_mas_usados(fecha_inicio, fecha_fin, servicio_id=None)
        items_servicios = stats_servicios.get('items', [])

        if servicio_id:
            ServicioModel = apps.get_model('Agendas', 'Servicio')
            try:
                nombre_servicio = ServicioModel.objects.get(id=servicio_id).nombre
                match = next((item for item in items_servicios if item['servicio'] == nombre_servicio), None)
                cantidad = match['cantidad'] if match else 0

                metrics.append({
                    'label': f'Consultas de {nombre_servicio}',
                    'value': cantidad
                })
            except Exception:
                pass
        else:
            for item in items_servicios:
                metrics.append({
                    'label': f"Consultas de {item['servicio']}",
                    'value': item['cantidad']
                })

        return metrics

    def get_dashboard_metrics(self, fecha_inicio=None, fecha_fin=None, servicio_id=None):
        """Consolida de manera UNIFICADA todas las métricas para la API del Dashboard."""
        atenciones = self.get_atenciones_stats(fecha_inicio, fecha_fin, servicio_id)
        servicios = self.get_servicios_mas_usados(fecha_inicio, fecha_fin, servicio_id)
        diagnosticos = self.get_diagnosticos_frecuentes(fecha_inicio, fecha_fin, servicio_id)
        por_genero = self.get_consultas_por_genero(fecha_inicio, fecha_fin, servicio_id)
        kpis_dinamicos = self.get_kpis_dinamicos(fecha_inicio, fecha_fin, servicio_id)

        # Calculamos la distribución por días reales de la semana
        days_data = self.get_consultas_por_dia(fecha_inicio, fecha_fin, servicio_id)

        return {
            'institucional': {
                'total_atenciones': atenciones['total_atenciones'],
                'servicios_activos': len(servicios['items']),
                'diagnosticos_rastreados': len(diagnosticos['items']),
            },
            'kpis_dinamicos': kpis_dinamicos,
            'servicios': servicios['items'],
            'diagnosticos': diagnosticos['items'][:5],
            'consultas_por_genero': por_genero,
            'days': days_data,  # <-- Inyectado limpiamente sin duplicados
            'tendencias': {
                'mes_anterior': {'atenciones': 0, 'crecimiento': 'N/A'},
                'mes_actual': {'atenciones': atenciones['total_atenciones'], 'crecimiento': 'N/A'},
            },
            'filtros_aplicados': self._filtros_aplicados(fecha_inicio, fecha_fin, servicio_id),
        }

    def generar_datos(self, reporte) -> str:
        try:
            Cita = apps.get_model('Agendas', 'Cita')
            ConsultaMedica = apps.get_model('Agendas', 'ConsultaMedica')
            ConsultaPsicologica = apps.get_model('Agendas', 'ConsultaPsicologica')
            ConsultaOdontologica = apps.get_model('Agendas', 'ConsultaOdontologica')
            ConsultaSocial = apps.get_model('Agendas', 'ConsultaSocial')
        except LookupError as e:
            logger.exception("No se pudieron cargar los modelos de Agendas: %s", e)
            raise

        service_type, _service_field = self._detect_cita_service_field(Cita)
        fecha_inicio = reporte.fecha_inicio
        fecha_fin = reporte.fecha_fin
        fecha_q = Q(fecha_creacion__date__gte=fecha_inicio) & Q(fecha_creacion__date__lte=fecha_fin)

        service_q = Q()
        if reporte.servicio:
            if service_type == 'fk':
                service_q &= Q(cita__servicio=reporte.servicio)
            elif service_type == 'm2m':
                service_q &= Q(cita__servicios=reporte.servicio)

        base_q = fecha_q & service_q
        use_select_related = (service_type == 'fk')
        select_related_args = []
        prefetch_related_args = []
        if use_select_related:
            select_related_args.append('cita__servicio')
            select_related_args.append('cita')
        else:
            select_related_args.append('cita')
            if service_type == 'm2m':
                prefetch_related_args.append('cita__servicios')

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
        return json.dumps(result, ensure_ascii=False)

    def export_to_csv(self, columns, rows):
        output = io.StringIO()
        writer = csv.writer(output, quoting=csv.QUOTE_MINIMAL)
        writer.writerow(columns)
        for r in rows:
            if isinstance(r, dict):
                row = [r.get(col, '') for col in columns]
            else:
                row = list(r)
            clean_row = [str(v) if v is not None else '' for v in row]
            writer.writerow(clean_row)
        return output.getvalue().encode('utf-8')

    def export_to_pdf(self, title, columns, rows, filtros):
        if A4 is None:
            raise RuntimeError('reportlab is required for PDF generation')

        buffer = io.BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=A4, rightMargin=30, leftMargin=30, topMargin=30, bottomMargin=18)
        elements = []
        styles = getSampleStyleSheet()

        elements.append(Paragraph(title, styles['Title']))
        elements.append(Spacer(1, 12))

        filtros_text = ', '.join([f"{k}: {v}" for k, v in (filtros or {}).items() if v])
        elements.append(Paragraph(f"Filtros aplicados: {filtros_text}", styles['Normal']))
        elements.append(Spacer(1, 12))

        # Traductor para que se vea bonito en el PDF
        traductor = {
            'tipo': 'Tipo de Consulta', 'cantidad': 'Cantidad', 'servicio': 'Servicio',
            'porcentaje': 'Porcentaje', 'genero': 'Género', 'codigo': 'Código', 'descripcion': 'Descripción'
        }

        # 1. Crear encabezados traducidos (o el nombre original si no hay traducción)
        encabezados_finales = [traductor.get(c, c.capitalize()) for c in columns]

        # 2. Construir datos de la tabla dinámicamente
        table_data = [encabezados_finales]
        for r in rows:
            fila = []
            for col in columns:
                valor = r.get(col, '') if isinstance(r, dict) else str(r)

                # Traducir valores internos (ej: 'medica' -> 'Medicina')
                valor_str = str(valor).lower()
                traducciones_valores = {'medica': 'Medicina', 'psicologica': 'Psicología',
                                        'odontologica': 'Odontología', 'social': 'Trabajo Social'}

                fila.append(str(traducciones_valores.get(valor_str, valor)))
            table_data.append(fila)

        table = Table(table_data, repeatRows=1)
        table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 10),
            ('GRID', (0, 0), (-1, -1), 0.25, colors.black),
        ]))
        elements.append(table)
        doc.build(elements)
        pdf = buffer.getvalue()
        buffer.close()
        return pdf

    def export_report(self, payload: dict, user):
        qp = {
            'fecha_inicio': payload.get('fecha_inicio'),
            'fecha_fin': payload.get('fecha_fin'),
            'servicio': payload.get('servicio') or payload.get('servicio_id') or payload.get('servicioId')
        }
        fecha_inicio, fecha_fin, servicio_id = self.parse_filters(qp)
        tipo = (payload.get('tipo') or payload.get('tipo_reporte') or '').lower() or 'generales'
        fmt = (payload.get('format') or payload.get('fmt') or '').lower()

        rows = []
        columns = []
        title = 'Reporte'
        filtros = self._filtros_aplicados(fecha_inicio, fecha_fin, servicio_id)

        if tipo in ('generales', 'general', 'atenciones'):
            stats = self.get_atenciones_stats(fecha_inicio, fecha_fin, servicio_id)
            items = stats.get('por_tipo_servicio') or []
            if not items:
                return {'success': False, 'message': 'No existen registros para el rango de fechas seleccionado.'}
            columns = ['tipo', 'cantidad']
            rows = items
            title = 'Atenciones por Tipo'
        elif tipo in ('servicio', 'servicios', 'servicios-mas-usados'):
            stats = self.get_servicios_mas_usados(fecha_inicio, fecha_fin, servicio_id)
            items = stats.get('items') or []
            if not items:
                return {'success': False, 'message': 'No existen registros para el rango de fechas seleccionado.'}
            columns = ['servicio', 'cantidad', 'porcentaje']
            rows = items
            title = 'Servicios más usados'
        elif tipo in ('genero', 'generos', 'consultas-por-genero'):
            stats = self.get_consultas_por_genero(fecha_inicio, fecha_fin, servicio_id)
            items = stats.get('items') or []
            if not items:
                return {'success': False, 'message': 'No existen registros para el rango de fechas seleccionado.'}
            columns = ['genero', 'cantidad', 'porcentaje']
            rows = items
            title = 'Consultas por Género'
        elif tipo in ('diagnosticos', 'diagnostico', 'diagnosticos-frecuentes'):
            stats = self.get_diagnosticos_frecuentes(fecha_inicio, fecha_fin, servicio_id)
            items = stats.get('items') or []
            if not items:
                return {'success': False, 'message': 'No existen registros para el rango de fechas seleccionado.'}
            columns = ['codigo', 'descripcion', 'cantidad']
            rows = items
            title = 'Diagnósticos frecuentes'
        else:
            stats = self.get_dashboard_metrics(fecha_inicio, fecha_fin, servicio_id)
            items = stats.get('servicios') or []
            if not items:
                return {'success': False, 'message': 'No existen registros para el rango de fechas seleccionado.'}
            columns = ['servicio', 'cantidad', 'porcentaje']
            rows = items
            title = 'Dashboard - Servicios'

        if fmt == 'csv':
            content = self.export_to_csv(columns, rows)
            filename = f"reporte-{tipo}-{datetime.utcnow().strftime('%Y%m%d')}.csv"
            return {'success': True, 'content': content, 'filename': filename, 'content_type': 'text/csv; charset=utf-8'}
        elif fmt == 'pdf':
            try:
                content = self.export_to_pdf(title, columns, rows, filtros)
            except Exception as e:
                logger.exception('Error generando PDF: %s', e)
                return {'success': False, 'message': 'Error al generar PDF'}
            filename = f"reporte-{tipo}-{datetime.utcnow().strftime('%Y%m%d')}.pdf"
            return {'success': True, 'content': content, 'filename': filename, 'content_type': 'application/pdf'}
        else:
            return {'success': False, 'message': 'Formato no soportado'}