from __future__ import annotations

from collections.abc import Mapping
from typing import Any

from django.core.exceptions import FieldDoesNotExist, ValidationError
from django.db import transaction

from .models import Antecedente, Caso, Documento, HistoriaClinica


def _validar_payload(payload: Mapping[str, Any]) -> None:
    if not isinstance(payload, Mapping):
        raise ValidationError({"detail": "El payload debe ser un objeto con pares clave/valor."})


def _crear_instancia(model_class, payload: Mapping[str, Any]):
    _validar_payload(payload)
    try:
        return model_class(**payload)
    except TypeError as exc:
        raise ValidationError({"detail": f"Datos invalidos para {model_class.__name__}: {exc}"}) from exc


def _actualizar_instancia(instancia, payload: Mapping[str, Any]):
    _validar_payload(payload)
    for campo, valor in payload.items():
        try:
            instancia._meta.get_field(campo)
        except FieldDoesNotExist as exc:
            raise ValidationError({campo: "Campo no permitido para actualizacion."}) from exc
        setattr(instancia, campo, valor)
    return instancia


def obtener_historias_clinicas():
    return HistoriaClinica.objects.all().prefetch_related("casos", "antecedentes", "documentos")


def obtener_historia_por_id(historia_id: int) -> HistoriaClinica:
    return HistoriaClinica.objects.prefetch_related("casos", "antecedentes", "documentos").get(
        pk=historia_id
    )


@transaction.atomic
def crear_historia_clinica(payload: Mapping[str, Any]) -> HistoriaClinica:
    historia = _crear_instancia(HistoriaClinica, payload)
    historia.full_clean()
    historia.save()
    return historia


@transaction.atomic
def actualizar_historia_clinica(historia_id: int, payload: Mapping[str, Any]) -> HistoriaClinica:
    historia = obtener_historia_por_id(historia_id)
    historia = _actualizar_instancia(historia, payload)
    historia.full_clean()
    historia.save()
    return historia


def obtener_casos_por_historia(historia_id: int):
    historia = obtener_historia_por_id(historia_id)
    return historia.casos.all()


@transaction.atomic
def crear_caso(historia_id: int, payload: Mapping[str, Any]) -> Caso:
    historia = obtener_historia_por_id(historia_id)
    caso = _crear_instancia(Caso, payload)
    caso.historia_clinica = historia
    caso.full_clean()
    caso.save()
    return caso


def obtener_caso_por_historia(historia_id: int, caso_id: int) -> Caso:
    obtener_historia_por_id(historia_id)
    return Caso.objects.get(pk=caso_id, historia_clinica_id=historia_id)


@transaction.atomic
def actualizar_caso(historia_id: int, caso_id: int, payload: Mapping[str, Any]) -> Caso:
    caso = obtener_caso_por_historia(historia_id, caso_id)
    caso = _actualizar_instancia(caso, payload)
    caso.full_clean()
    caso.save()
    return caso


@transaction.atomic
def eliminar_caso(historia_id: int, caso_id: int) -> None:
    caso = obtener_caso_por_historia(historia_id, caso_id)
    caso.delete()


def obtener_antecedentes_por_historia(historia_id: int):
    historia = obtener_historia_por_id(historia_id)
    return historia.antecedentes.all()


@transaction.atomic
def crear_antecedente(historia_id: int, payload: Mapping[str, Any]) -> Antecedente:
    historia = obtener_historia_por_id(historia_id)
    antecedente = _crear_instancia(Antecedente, payload)
    antecedente.historia_clinica = historia
    antecedente.full_clean()
    antecedente.save()
    return antecedente


def obtener_antecedente_por_historia(historia_id: int, antecedente_id: int) -> Antecedente:
    obtener_historia_por_id(historia_id)
    return Antecedente.objects.get(pk=antecedente_id, historia_clinica_id=historia_id)


@transaction.atomic
def actualizar_antecedente(
    historia_id: int, antecedente_id: int, payload: Mapping[str, Any]
) -> Antecedente:
    antecedente = obtener_antecedente_por_historia(historia_id, antecedente_id)
    antecedente = _actualizar_instancia(antecedente, payload)
    antecedente.full_clean()
    antecedente.save()
    return antecedente


@transaction.atomic
def eliminar_antecedente(historia_id: int, antecedente_id: int) -> None:
    antecedente = obtener_antecedente_por_historia(historia_id, antecedente_id)
    antecedente.delete()


def obtener_documentos_por_historia(historia_id: int):
    historia = obtener_historia_por_id(historia_id)
    return historia.documentos.all()


@transaction.atomic
def crear_documento(historia_id: int, payload: Mapping[str, Any]) -> Documento:
    historia = obtener_historia_por_id(historia_id)
    documento = _crear_instancia(Documento, payload)
    documento.historia_clinica = historia
    documento.full_clean()
    documento.save()
    return documento


def obtener_documento_por_historia(historia_id: int, documento_id: int) -> Documento:
    obtener_historia_por_id(historia_id)
    return Documento.objects.get(pk=documento_id, historia_clinica_id=historia_id)


@transaction.atomic
def actualizar_documento(historia_id: int, documento_id: int, payload: Mapping[str, Any]) -> Documento:
    documento = obtener_documento_por_historia(historia_id, documento_id)
    documento = _actualizar_instancia(documento, payload)
    documento.full_clean()
    documento.save()
    return documento


@transaction.atomic
def eliminar_documento(historia_id: int, documento_id: int) -> None:
    documento = obtener_documento_por_historia(historia_id, documento_id)
    documento.delete()
