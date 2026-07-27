import logging

from datetime import timedelta, date, datetime, time, timezone as dt_timezone
from django.db import transaction
from django.utils import timezone

from .models import (
    Cita, EstadoCita, Servicio, Derivacion, TipoDerivacion,
    SignosVitales, ConsultaMedica,
    ConsultaOdontologica, ConsultaPsicologica, ConsultaSocial
)
from Historias.services import obtener_historia_clinica_por_cita, HistoriaClinicaNoEncontrada

logger = logging.getLogger(__name__)


# Mapeo de Servicio a nombre de Rol en Seguridad
SERVICIO_ROL_MAP = {
    'Medicina General': 'medico',
    'Medicina': 'medico',
    'Odontologia': 'odontologo',
    'Odontología': 'odontologo',
    'Psicologia': 'psicologo',
    'Psicología': 'psicologo',
    'Trabajo Social': 'trabajador_social',
}

HORA_INICIO = time(8, 0)
HORA_FIN = time(17, 30)
RECESO_INICIO = time(12, 30)
RECESO_FIN = time(15, 0)
SLOT_MINUTOS = 30


class ConflictoHorarioError(Exception):
    """Excepción para conflictos de horario de citas."""


class DatosInvalidosError(Exception):
    """Excepción para datos inválidos o campos faltantes."""
    def __init__(self, message, code='BAD_REQUEST'):
        self.code = code
        super().__init__(message)


class EstadoCitaInvalidoError(Exception):
    """Excepción cuando la cita no está en estado válido para la operación."""


ESTADOS_ACTIVOS = [EstadoCita.AGENDADA, EstadoCita.CONFIRMADA]
ESTADOS_INACTIVOS = [EstadoCita.CANCELADA, EstadoCita.REAGENDADA]


def validar_choque_citas(profesional_id, fecha_hora, duracion_minutos=60, excluir_cita_id=None, usuario_id=None):
    """Valida que un profesional no tenga citas superpuestas y que el paciente no tenga cita en ese horario."""
    if fecha_hora < timezone.now():
        raise DatosInvalidosError('La fecha y hora de la cita deben ser futuras.')

    if usuario_id:
        paciente_conflicto = Cita.objects.filter(
            usuario_id=usuario_id,
            fecha_hora=fecha_hora,
        ).exclude(
            estado__in=ESTADOS_INACTIVOS,
        )
        if excluir_cita_id:
            paciente_conflicto = paciente_conflicto.exclude(id=excluir_cita_id)
        if paciente_conflicto.exists():
            raise ConflictoHorarioError(
                'Ya tienes una cita agendada en esa fecha y hora.'
            )

    if not profesional_id:
        return True

    tiempo_fin = fecha_hora + timedelta(minutes=duracion_minutos)
    tiempo_inicio = fecha_hora - timedelta(minutes=duracion_minutos)

    citas_conflictivas = Cita.objects.filter(
        profesional_id=profesional_id,
        estado__in=ESTADOS_ACTIVOS,
    )

    if excluir_cita_id:
        citas_conflictivas = citas_conflictivas.exclude(id=excluir_cita_id)

    citas_conflictivas = citas_conflictivas.filter(
        fecha_hora__lt=tiempo_fin,
        fecha_hora__gte=tiempo_inicio,
    )

    if citas_conflictivas.exists():
        raise ConflictoHorarioError(
            f'El profesional ya tiene una cita en ese horario.'
        )

    profesional_como_paciente = Cita.objects.filter(
        usuario_id=profesional_id,
        estado__in=ESTADOS_ACTIVOS,
    )
    if excluir_cita_id:
        profesional_como_paciente = profesional_como_paciente.exclude(id=excluir_cita_id)
    profesional_como_paciente = profesional_como_paciente.filter(
        fecha_hora__lt=tiempo_fin,
        fecha_hora__gte=tiempo_inicio,
    )
    if profesional_como_paciente.exists():
        raise ConflictoHorarioError(
            'El profesional tiene una cita como paciente en ese horario.'
        )

    return True


def validar_misma_especialidad_mismo_dia(usuario_id, fecha_hora, servicios_ids, excluir_cita_id=None):
    """Valida que un paciente no tenga dos citas de la misma especialidad el mismo día."""
    fecha_date = fecha_hora.date()
    citas_mismo_dia = Cita.objects.filter(
        usuario_id=usuario_id,
        fecha_hora__date=fecha_date,
        servicios__id__in=servicios_ids,
    ).exclude(
        estado__in=ESTADOS_INACTIVOS,
    )
    if excluir_cita_id:
        citas_mismo_dia = citas_mismo_dia.exclude(id=excluir_cita_id)
    if citas_mismo_dia.exists():
        raise ConflictoHorarioError(
            'Ya tienes una cita agendada de esta especialidad en el mismo día.'
        )


def validar_anticipacion_minima(fecha_hora, horas=24):
    """Valida que una fecha/hora cumpla con la anticipación mínima respecto al momento actual."""
    ahora = timezone.now()
    return fecha_hora >= ahora + timedelta(hours=horas)


def validar_servicios_cita(servicios_ids):
    """Valida que los servicios existan y estén activos."""
    if not servicios_ids:
        raise DatosInvalidosError('Debe especificar al menos un servicio.')

    ids = [s if isinstance(s, int) else s.id for s in servicios_ids]
    servicios = Servicio.objects.filter(id__in=ids, es_activo=True)

    if servicios.count() != len(set(ids)):
        raise DatosInvalidosError('Uno o más servicios no existen o están inactivos.')

    return servicios


def registrar_atencion_integral(cita_id, tipo_consulta, datos_consulta):
    """Registra una atención/consulta polimórfica y la asocia a una cita."""
    try:
        cita = Cita.objects.get(id=cita_id)
    except Cita.DoesNotExist:
        raise DatosInvalidosError(f'La cita con ID {cita_id} no existe.')

    if cita.estado not in [EstadoCita.AGENDADA, EstadoCita.CONFIRMADA]:
        raise EstadoCitaInvalidoError(
            f'No se puede registrar una atención para una cita en estado {cita.estado}.'
        )

    try:
        historia_clinica = obtener_historia_clinica_por_cita(cita_id)
    except HistoriaClinicaNoEncontrada as e:
        raise DatosInvalidosError(str(e))

    historia_clinica_id = historia_clinica.id

    tipo_consulta = tipo_consulta.lower()

    try:
        with transaction.atomic():
            if tipo_consulta == 'medica':
                if not all(k in datos_consulta for k in ['anamnesis', 'tratamiento', 'diagnostico']):
                    raise DatosInvalidosError('Faltan campos requeridos para consulta médica.')

                signos = datos_consulta.get('signos_vitales')
                if not signos:
                    raise DatosInvalidosError('Los signos vitales son obligatorios para consulta médica.')

                signos_obj = SignosVitales.objects.create(
                    peso_kg=signos.get('peso_kg'),
                    temperatura=signos.get('temperatura'),
                    presion_arterial=signos.get('presion_arterial', ''),
                    frecuencia_cardiaca=signos.get('frecuencia_cardiaca'),
                )

                consulta = ConsultaMedica.objects.create(
                    cita=cita,
                    historia_clinica_id=historia_clinica_id,
                    anamnesis=datos_consulta['anamnesis'],
                    tratamiento=datos_consulta['tratamiento'],
                    diagnostico=datos_consulta['diagnostico'],
                    observaciones=datos_consulta.get('observaciones', ''),
                    signos_vitales=signos_obj,
                )

            elif tipo_consulta == 'odontologica':
                if not all(k in datos_consulta for k in ['odontograma', 'procedimientos']):
                    raise DatosInvalidosError('Faltan campos requeridos para consulta odontológica.')

                consulta = ConsultaOdontologica.objects.create(
                    cita=cita,
                    historia_clinica_id=historia_clinica_id,
                    odontograma=datos_consulta['odontograma'],
                    procedimientos=datos_consulta['procedimientos'],
                    observaciones=datos_consulta.get('observaciones', ''),
                )

            elif tipo_consulta == 'psicologica':
                if 'diagnostico' not in datos_consulta:
                    raise DatosInvalidosError('Faltan campos requeridos para consulta psicológica.')

                consulta = ConsultaPsicologica.objects.create(
                    cita=cita,
                    historia_clinica_id=historia_clinica_id,
                    notas_evolucion=datos_consulta.get('notas_evolucion', ''),
                    estado_humor=datos_consulta.get('estado_humor', ''),
                    nivel_ansiedad=datos_consulta.get('nivel_ansiedad', 0),
                    nivel_autoestima=datos_consulta.get('nivel_autoestima', 0),
                    diagnostico=datos_consulta['diagnostico'],
                    observaciones=datos_consulta.get('observaciones', ''),
                )

            elif tipo_consulta == 'social':
                consulta = ConsultaSocial.objects.create(
                    cita=cita,
                    historia_clinica_id=historia_clinica_id,
                    nivel_socioeconomico=datos_consulta.get('nivel_socioeconomico', ''),
                    descripcion_vivienda=datos_consulta.get('descripcion_vivienda', ''),
                    observaciones=datos_consulta.get('observaciones', ''),
                )

            else:
                raise DatosInvalidosError(
                    f'Tipo de consulta inválido: {tipo_consulta}. '
                    'Los valores válidos son medica, odontologica, psicologica, social.'
                )

            servicios = datos_consulta.get('servicios')
            if servicios:
                consulta.servicios.set(validar_servicios_cita(servicios))

            cita.estado = EstadoCita.ATENDIDA
            cita.save()

        from Notificaciones.services import generate_notification_for_event
        try:
            generate_notification_for_event(
                event_type='atencion',
                destinatario=cita.usuario_id,
                cita=cita,
                detalles={'mensaje': 'Su atención médica ha sido registrada.'},
            )
        except Exception as exc:
            logger.exception('Error al crear notificación de atención para cita %s: %s', cita.id, exc)

        return consulta

    except (DatosInvalidosError, EstadoCitaInvalidoError):
        raise
    except Exception as exc:
        raise DatosInvalidosError(f'Error al registrar la atención: {str(exc)}')


def obtener_atencion_por_cita(cita_id):
    """Obtiene la consulta/atención asociada a una cita."""
    modelos = [ConsultaMedica, ConsultaOdontologica, ConsultaPsicologica, ConsultaSocial]
    for modelo in modelos:
        try:
            return modelo.objects.get(cita_id=cita_id)
        except modelo.DoesNotExist:
            continue
    return None


def actualizar_atencion(consulta_id, tipo_consulta, datos_consulta):
    """Actualiza una consulta existente con nuevos datos."""
    tipo_consulta = tipo_consulta.lower()
    modelos = {
        'medica': ConsultaMedica,
        'odontologica': ConsultaOdontologica,
        'psicologica': ConsultaPsicologica,
        'social': ConsultaSocial,
    }
    modelo = modelos.get(tipo_consulta)
    if not modelo:
        raise DatosInvalidosError(f'Tipo de consulta inválido: {tipo_consulta}')

    try:
        consulta = modelo.objects.get(id=consulta_id)
    except modelo.DoesNotExist:
        raise DatosInvalidosError(f'No existe consulta {tipo_consulta} con ID {consulta_id}')

    with transaction.atomic():
        historia_clinica_id = datos_consulta.get('historia_clinica_id')
        if historia_clinica_id:
            consulta.historia_clinica_id = historia_clinica_id

        if 'observaciones' in datos_consulta:
            consulta.observaciones = datos_consulta['observaciones']

        if tipo_consulta == 'medica':
            if 'anamnesis' in datos_consulta:
                consulta.anamnesis = datos_consulta['anamnesis']
            if 'tratamiento' in datos_consulta:
                consulta.tratamiento = datos_consulta['tratamiento']
            if 'diagnostico' in datos_consulta:
                consulta.diagnostico = datos_consulta['diagnostico']
            if 'signos_vitales' in datos_consulta:
                signos = datos_consulta['signos_vitales']
                sv = consulta.signos_vitales
                if 'peso_kg' in signos:
                    sv.peso_kg = signos['peso_kg']
                if 'temperatura' in signos:
                    sv.temperatura = signos['temperatura']
                if 'presion_arterial' in signos:
                    sv.presion_arterial = signos['presion_arterial']
                if 'frecuencia_cardiaca' in signos:
                    sv.frecuencia_cardiaca = signos['frecuencia_cardiaca']
                sv.save()

        elif tipo_consulta == 'odontologica':
            if 'odontograma' in datos_consulta:
                consulta.odontograma = datos_consulta['odontograma']
            if 'procedimientos' in datos_consulta:
                consulta.procedimientos = datos_consulta['procedimientos']

        elif tipo_consulta == 'psicologica':
            if 'diagnostico' in datos_consulta:
                consulta.diagnostico = datos_consulta['diagnostico']
            if 'notas_evolucion' in datos_consulta:
                consulta.notas_evolucion = datos_consulta['notas_evolucion']
            if 'estado_humor' in datos_consulta:
                consulta.estado_humor = datos_consulta['estado_humor']
            if 'nivel_ansiedad' in datos_consulta:
                consulta.nivel_ansiedad = datos_consulta['nivel_ansiedad']
            if 'nivel_autoestima' in datos_consulta:
                consulta.nivel_autoestima = datos_consulta['nivel_autoestima']

        elif tipo_consulta == 'social':
            if 'nivel_socioeconomico' in datos_consulta:
                consulta.nivel_socioeconomico = datos_consulta['nivel_socioeconomico']
            if 'descripcion_vivienda' in datos_consulta:
                consulta.descripcion_vivienda = datos_consulta['descripcion_vivienda']

        servicios = datos_consulta.get('servicios')
        if servicios:
            consulta.servicios.set(validar_servicios_cita(servicios))

        consulta.save()
        return consulta


def _generar_slots_dia(dia):
    """Genera los slots de 30 min disponibles para un día (08:00-11:30, 13:00-17:30)."""
    slots = []
    # Mañana
    hora_actual = datetime.combine(dia, HORA_INICIO)
    fin_manana = datetime.combine(dia, RECESO_INICIO)
    while hora_actual + timedelta(minutes=SLOT_MINUTOS) <= fin_manana:
        slots.append(hora_actual)
        hora_actual += timedelta(minutes=SLOT_MINUTOS)
    # Tarde
    hora_actual = datetime.combine(dia, RECESO_FIN)
    fin_tarde = datetime.combine(dia, HORA_FIN)
    while hora_actual + timedelta(minutes=SLOT_MINUTOS) <= fin_tarde:
        slots.append(hora_actual)
        hora_actual += timedelta(minutes=SLOT_MINUTOS)
    return slots


def buscar_siguiente_cita_disponible(servicio_id, servicio_nombre, usuario_id):
    """Busca el próximo slot disponible para un servicio y paciente."""
    from Seguridad.models import Cuenta

    rol_nombre = SERVICIO_ROL_MAP.get(servicio_nombre) or SERVICIO_ROL_MAP.get(
        Servicio.objects.get(id=servicio_id).nombre
    )
    if not rol_nombre:
        raise DatosInvalidosError(
            f'No se encontró un rol para el servicio con ID {servicio_id}.'
        )

    profesionales = Cuenta.objects.filter(
        roles__nombre=rol_nombre,
        is_active=True,
    ).order_by('id')

    if not profesionales.exists():
        raise DatosInvalidosError(
            f'No hay profesionales activos para el servicio "{servicio_nombre}".'
        )

    ahora = timezone.now()
    inicio_minimo = ahora + timedelta(hours=24)
    fecha = inicio_minimo.date()
    for _ in range(30):
        if fecha.weekday() >= 5:
            fecha += timedelta(days=1)
            continue

        slots = _generar_slots_dia(fecha)

        for profesional in profesionales:
            citas_existentes = Cita.objects.filter(
                profesional_id=profesional.id,
                fecha_hora__date=fecha,
                estado__in=[EstadoCita.AGENDADA, EstadoCita.CONFIRMADA],
            ).values_list('fecha_hora', flat=True)

            for slot in slots:
                slot_aware = timezone.make_aware(slot)
                if slot_aware < inicio_minimo:
                    continue
                if slot_aware in citas_existentes:
                    continue
                # Verificar que el usuario no tenga cita en ese horario
                if Cita.objects.filter(
                    usuario_id=usuario_id,
                    fecha_hora=slot_aware,
                ).exclude(
                    estado__in=ESTADOS_INACTIVOS,
                ).exists():
                    continue
                return profesional.id, slot_aware

        fecha += timedelta(days=1)

    raise DatosInvalidosError(
        'No se encontró disponibilidad en los próximos 30 días para el servicio destino.'
    )


def gestionar_derivacion(usuario_id, remitente_id, destinatario, tipo_derivacion, motivo):
    """Crea una derivación y auto-agenda una cita en el servicio destino."""
    if not usuario_id:
        raise DatosInvalidosError('Debe proporcionar usuario_id.')
    if not remitente_id:
        raise DatosInvalidosError('Debe proporcionar remitente_id.')
    if not destinatario:
        raise DatosInvalidosError('Debe indicar el destinatario de la derivación.')

    if tipo_derivacion not in TipoDerivacion.values:
        raise DatosInvalidosError('Tipo de derivación inválido. Debe ser INTERNA o EXTERNA.')

    if tipo_derivacion != TipoDerivacion.INTERNA:
        return Derivacion.objects.create(
            usuario_id=usuario_id,
            remitente_id=remitente_id,
            destinatario=destinatario,
            tipo=tipo_derivacion,
            motivo=motivo,
        )

    try:
        servicio_destino_id = int(destinatario)
        servicio = Servicio.objects.get(id=servicio_destino_id, es_activo=True)
    except (ValueError, Servicio.DoesNotExist):
        raise DatosInvalidosError(f'El servicio destino "{destinatario}" no es válido.')

    with transaction.atomic():
        profesional_id, fecha_hora = buscar_siguiente_cita_disponible(
            servicio_id=servicio.id,
            servicio_nombre=servicio.nombre,
            usuario_id=usuario_id,
        )

        cita = Cita.objects.create(
            usuario_id=usuario_id,
            profesional_id=profesional_id,
            fecha_hora=fecha_hora,
            estado=EstadoCita.AGENDADA,
            motivo=f'Derivación: {motivo[:200]}',
        )
        cita.servicios.add(servicio)

        derivacion = Derivacion.objects.create(
            usuario_id=usuario_id,
            remitente_id=remitente_id,
            destinatario=destinatario,
            tipo=tipo_derivacion,
            motivo=motivo,
        )

    return derivacion, cita
