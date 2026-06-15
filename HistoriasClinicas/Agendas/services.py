from datetime import timedelta
from django.db import transaction
from django.utils import timezone

from .models import (
    Cita, EstadoCita, Servicio, Derivacion, TipoDerivacion,
    SignosVitales, ConsultaMedica,
    ConsultaOdontologica, ConsultaPsicologica, ConsultaSocial
)


class ConflictoHorarioError(Exception):
    """Excepción para conflictos de horario de citas."""


class DatosInvalidosError(Exception):
    """Excepción para datos inválidos o campos faltantes."""


class EstadoCitaInvalidoError(Exception):
    """Excepción cuando la cita no está en estado válido para la operación."""


def validar_choque_citas(usuario_id, fecha_hora, duracion_minutos=60, excluir_cita_id=None):
    """Valida que un usuario no tenga citas superpuestas."""
    if fecha_hora < timezone.now():
        raise DatosInvalidosError('La fecha y hora de la cita deben ser futuras.')

    tiempo_fin = fecha_hora + timedelta(minutes=duracion_minutos)
    tiempo_inicio = fecha_hora - timedelta(minutes=duracion_minutos)

    citas_conflictivas = Cita.objects.filter(
        usuario_id=usuario_id,
        estado__in=[EstadoCita.AGENDADA, EstadoCita.CONFIRMADA],
    )

    if excluir_cita_id:
        citas_conflictivas = citas_conflictivas.exclude(id=excluir_cita_id)

    citas_conflictivas = citas_conflictivas.filter(
        fecha_hora__lt=tiempo_fin,
        fecha_hora__gte=tiempo_inicio,
    )

    if citas_conflictivas.exists():
        raise ConflictoHorarioError(
            f'El usuario {usuario_id} ya tiene una cita en ese horario.'
        )

    return True


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

    historia_clinica_id = datos_consulta.get('historia_clinica_id')
    if not historia_clinica_id:
        raise DatosInvalidosError('Debe proporcionar historia_clinica_id para la consulta.')

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


def gestionar_derivacion(usuario_id, remitente_id, destinatario, tipo_derivacion, motivo):
    """Crea una derivación interna o externa para un usuario."""
    if not usuario_id:
        raise DatosInvalidosError('Debe proporcionar usuario_id.')
    if not remitente_id:
        raise DatosInvalidosError('Debe proporcionar remitente_id.')
    if not destinatario:
        raise DatosInvalidosError('Debe indicar el destinatario de la derivación.')

    if tipo_derivacion not in TipoDerivacion.values:
        raise DatosInvalidosError('Tipo de derivación inválido. Debe ser INTERNA o EXTERNA.')

    return Derivacion.objects.create(
        usuario_id=usuario_id,
        remitente_id=remitente_id,
        destinatario=destinatario,
        tipo=tipo_derivacion,
        motivo=motivo,
    )
