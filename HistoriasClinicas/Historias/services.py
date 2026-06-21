from __future__ import annotations

from collections.abc import Mapping
from typing import Any

from django.core.exceptions import ValidationError
from django.db import transaction

from .models import Antecedente, Caso, Documento, HistoriaClinica


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
        'trabajador social': 'medico',
        'paciente': 'paciente',
        'administrador': 'administrador',
        'admin': 'administrador',
    }
    sin_acentos = ''.join(
        c for c in unicodedata.normalize('NFKD', nombre_rol)
        if not unicodedata.combining(c)
    )
    normalizado = sin_acentos.lower().strip()
    return mapeo.get(normalizado)


def _rol_nombre(user):
    return getattr(getattr(user, 'rol', None), 'nombre', '')


def es_medico(user):
    return normalizar_rol(_rol_nombre(user)) == 'medico'


def es_paciente(user):
    return normalizar_rol(_rol_nombre(user)) == 'paciente'


def es_administrador(user):
    return normalizar_rol(_rol_nombre(user)) == 'administrador'


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
