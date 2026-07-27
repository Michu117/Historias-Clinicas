from __future__ import annotations

from collections.abc import Mapping
from typing import Any

from django.core.exceptions import ValidationError
from django.db import transaction

from .models import Antecedente, Caso, Documento, HistoriaClinica


class HistoriaClinicaNoEncontrada(Exception):
    pass


def _validar_datos(datos: Mapping[str, Any]) -> None:
    if not isinstance(datos, Mapping):
        raise ValidationError({"detail": "Los datos deben enviarse como objeto clave/valor."})


@transaction.atomic
def crear_instancia(modelo, datos: Mapping[str, Any]):
    _validar_datos(datos)
    instancia = modelo(**dict(datos))
    instancia.full_clean()
    instancia.save()
    return instancia


@transaction.atomic
def actualizar_instancia(
    instancia,
    datos: Mapping[str, Any],
    campos_protegidos: set[str] | None = None,
):
    _validar_datos(datos)
    protegidos = set(campos_protegidos or set())
    protegidos.add(instancia._meta.pk.name)

    for campo, valor in datos.items():
        if campo in protegidos:
            continue
        setattr(instancia, campo, valor)

    instancia.full_clean()
    instancia.save()
    return instancia


@transaction.atomic
def eliminar_instancia(instancia) -> None:
    instancia.delete()


def obtener_por_id(modelo, id: int, **filtros):
    return modelo.objects.get(pk=id, **filtros)


def obtener_por_relacion(modelo, **filtros):
    return modelo.objects.filter(**filtros)


import unicodedata


def normalizar_rol(nombre_rol: str | None) -> str | None:
    if not nombre_rol:
        return None
    mapeo = {
        'medico': 'medico',
        'psicologo': 'medico',
        'odontologo': 'medico',
        'trabajador social': 'trabajador_social',
        'trabajador_social': 'trabajador_social',
        'trabajadorsocial': 'trabajador_social',
        'trabajo social': 'trabajador_social',
        'paciente': 'paciente',
        'usuario': 'paciente',
        'administrador': 'administrador',
        'admin': 'administrador',
    }
    sin_acentos = ''.join(
        c for c in unicodedata.normalize('NFKD', nombre_rol)
        if not unicodedata.combining(c)
    )
    normalizado = sin_acentos.lower().strip()
    return mapeo.get(normalizado)


def _roles_nombres(user):
    if not user or not user.is_authenticated:
        return []
    return list(user.roles.values_list('nombre', flat=True))


def _tiene_rol_normalizado(user, rol_buscado):
    return any(normalizar_rol(r) == rol_buscado for r in _roles_nombres(user))


def es_medico(user):
    return _tiene_rol_normalizado(user, 'medico')


def es_trabajador_social(user):
    return _tiene_rol_normalizado(user, 'trabajador_social')


def es_paciente(user):
    return _tiene_rol_normalizado(user, 'paciente')


def es_administrador(user):
    return _tiene_rol_normalizado(user, 'administrador')


def obtener_historias_clinicas():
    return HistoriaClinica.objects.prefetch_related("casos", "antecedentes", "documentos").all()


def obtener_historia_por_id(historia_id: int, usuario = None) -> HistoriaClinica:
    query = HistoriaClinica.objects.prefetch_related("casos", "antecedentes", "documentos")
    if usuario is not None:
        query = query.filter(usuario=usuario)
    return query.get(pk=historia_id)


def crear_historia_clinica(payload: Mapping[str, Any], usuario) -> HistoriaClinica:
    if HistoriaClinica.objects.filter(usuario=usuario).exists():
        raise ValidationError(
            {
                "usuario": [
                    "El usuario autenticado ya tiene una historia clinica registrada.",
                ]
            }
        )
    datos = dict(payload)
    datos["usuario"] = usuario
    return crear_instancia(HistoriaClinica, datos)


def actualizar_historia_clinica(historia_id: int, payload: Mapping[str, Any], usuario) -> HistoriaClinica:
    historia = obtener_historia_por_id(historia_id, usuario=usuario)
    return actualizar_instancia(historia, payload, campos_protegidos={"id", "usuario"})


@transaction.atomic
def eliminar_historia_clinica(historia_id: int) -> None:
    historia = obtener_historia_por_id(historia_id)
    eliminar_instancia(historia)


def obtener_casos_por_historia(historia_id: int):
    return obtener_por_relacion(Caso, historia_clinica_id=historia_id)


def crear_caso(historia_id: int, payload: Mapping[str, Any]) -> Caso:
    historia = obtener_historia_por_id(historia_id)
    datos = dict(payload)
    datos.pop("historia_clinica", None)
    datos["historia_clinica"] = historia
    return crear_instancia(Caso, datos)


def obtener_caso_por_historia(historia_id: int, caso_id: int) -> Caso:
    return Caso.objects.get(pk=caso_id, historia_clinica_id=historia_id)


def actualizar_caso(historia_id: int, caso_id: int, payload: Mapping[str, Any]) -> Caso:
    caso = obtener_caso_por_historia(historia_id, caso_id)
    return actualizar_instancia(
        caso,
        payload,
        campos_protegidos={"id", "historia_clinica", "historia_clinica_id"},
    )


def eliminar_caso(historia_id: int, caso_id: int) -> None:
    caso = obtener_caso_por_historia(historia_id, caso_id)
    eliminar_instancia(caso)


def obtener_antecedentes_por_historia(historia_id: int):
    return obtener_por_relacion(Antecedente, historia_clinica_id=historia_id)


def crear_antecedente(historia_id: int, payload: Mapping[str, Any]) -> Antecedente:
    historia = obtener_historia_por_id(historia_id)
    datos = dict(payload)
    datos.pop("historia_clinica", None)
    datos["historia_clinica"] = historia
    return crear_instancia(Antecedente, datos)


def obtener_antecedente_por_historia(historia_id: int, antecedente_id: int) -> Antecedente:
    return Antecedente.objects.get(pk=antecedente_id, historia_clinica_id=historia_id)


def actualizar_antecedente(
    historia_id: int,
    antecedente_id: int,
    payload: Mapping[str, Any],
) -> Antecedente:
    antecedente = obtener_antecedente_por_historia(historia_id, antecedente_id)
    return actualizar_instancia(
        antecedente,
        payload,
        campos_protegidos={"id", "historia_clinica", "historia_clinica_id"},
    )


def eliminar_antecedente(historia_id: int, antecedente_id: int) -> None:
    antecedente = obtener_antecedente_por_historia(historia_id, antecedente_id)
    eliminar_instancia(antecedente)


def obtener_documentos_por_historia(historia_id: int):
    return obtener_por_relacion(Documento, historia_clinica_id=historia_id)


def crear_documento(historia_id: int, payload: Mapping[str, Any]) -> Documento:
    historia = obtener_historia_por_id(historia_id)
    datos = dict(payload)
    datos.pop("historia_clinica", None)
    datos["historia_clinica"] = historia
    return crear_instancia(Documento, datos)


def obtener_documento_por_historia(historia_id: int, documento_id: int) -> Documento:
    return Documento.objects.get(pk=documento_id, historia_clinica_id=historia_id)


def actualizar_documento(historia_id: int, documento_id: int, payload: Mapping[str, Any]) -> Documento:
    documento = obtener_documento_por_historia(historia_id, documento_id)
    return actualizar_instancia(
        documento,
        payload,
        campos_protegidos={"id", "historia_clinica", "historia_clinica_id"},
    )


def eliminar_documento(historia_id: int, documento_id: int) -> None:
    documento = obtener_documento_por_historia(historia_id, documento_id)
    eliminar_instancia(documento)


def obtener_historia_clinica_por_cita(cita_id):
    from Agendas.models import Cita
    from Seguridad.models import Cuenta

    try:
        cita = Cita.objects.get(id=cita_id)
        cuenta = Cuenta.objects.get(id=cita.usuario_id)
    except (Cita.DoesNotExist, Cuenta.DoesNotExist) as e:
        raise HistoriaClinicaNoEncontrada(str(e))

    usuario = getattr(cuenta, 'perfil', None)
    if usuario is None:
        raise HistoriaClinicaNoEncontrada(
            'El paciente no tiene un perfil de usuario asociado.'
        )

    try:
        return HistoriaClinica.objects.get(usuario=usuario)
    except HistoriaClinica.DoesNotExist as e:
        raise HistoriaClinicaNoEncontrada(str(e))


MAPA_ESTADO_CASO = {
    'AGENDADA': 'AGENDADO',
    'CONFIRMADA': 'CONFIRMADO',
    'REAGENDADA': 'REAGENDADO',
    'CANCELADA': 'CANCELADO',
    'NO_ASISTIDA': 'NO_ASISTIO',
    'ATENDIDA': 'CERRADO',
}


def obtener_estado_caso(estado_cita):
    return MAPA_ESTADO_CASO.get(estado_cita, estado_cita)


def listar_casos_clinicos(historia_clinica_id):
    from Agendas.models import Cita, ConsultaMedica, ConsultaOdontologica, ConsultaPsicologica, ConsultaSocial
    from Seguridad.models import Cuenta

    historia = HistoriaClinica.objects.get(id=historia_clinica_id)
    cuenta_id = historia.usuario.cuenta.id
    citas = Cita.objects.filter(usuario_id=cuenta_id).prefetch_related('servicios').order_by('-fecha_hora')

    cita_ids = [c.id for c in citas]

    consultas_por_cita = {}
    TIPO_CONSULTA_MAP = {
        ConsultaMedica: 'Consulta médica',
        ConsultaOdontologica: 'Consulta odontológica',
        ConsultaPsicologica: 'Consulta psicológica',
        ConsultaSocial: 'Consulta social',
    }
    for model_cls, tipo_label in TIPO_CONSULTA_MAP.items():
        qs = model_cls.objects.filter(cita_id__in=cita_ids).select_related('cita')
        for obj in qs:
            consultas_por_cita[obj.cita_id] = (obj, tipo_label)

    reagendadas_ids = set(
        Cita.objects.filter(
            usuario_id=cuenta_id, estado='REAGENDADA'
        ).values_list('id', flat=True)
    )

    resultados = []
    for cita in citas:
        if cita.id in reagendadas_ids:
            continue
        tiene_consulta = cita.id in consultas_por_cita
        consulta_data = None
        if tiene_consulta:
            consulta_obj, tipo_label = consultas_por_cita[cita.id]
            signos_vitales = None
            if hasattr(consulta_obj, 'signos_vitales') and consulta_obj.signos_vitales is not None:
                sv = consulta_obj.signos_vitales
                signos_vitales = {
                    'peso_kg': getattr(sv, 'peso_kg', None),
                    'temperatura': getattr(sv, 'temperatura', None),
                    'presion_arterial': getattr(sv, 'presion_arterial', None),
                    'frecuencia_cardiaca': getattr(sv, 'frecuencia_cardiaca', None),
                }
            consulta_data = {
                'id': consulta_obj.id,
                'tipo': tipo_label,
                'observaciones': consulta_obj.observaciones or '',
                'anamnesis': getattr(consulta_obj, 'anamnesis', None),
                'diagnostico': getattr(consulta_obj, 'diagnostico', None),
                'tratamiento': getattr(consulta_obj, 'tratamiento', None),
                'signos_vitales': signos_vitales,
            }

        profesional_nombre = None
        if cita.profesional_id:
            try:
                prof_cuenta = Cuenta.objects.get(id=cita.profesional_id)
                profesional_nombre = getattr(prof_cuenta.perfil, 'nombre_completo', None)
            except (Cuenta.DoesNotExist, AttributeError):
                pass

        servicios = [s.nombre for s in cita.servicios.all()] if cita.pk else []

        resultados.append({
            'cita_id': cita.id,
            'fecha_hora': cita.fecha_hora,
            'servicios': servicios,
            'profesional': profesional_nombre,
            'motivo': cita.motivo or '',
            'estado_cita': cita.estado,
            'estado_caso': obtener_estado_caso(cita.estado),
            'tiene_consulta': tiene_consulta,
            'consulta': consulta_data,
        })

    return resultados
