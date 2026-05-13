from __future__ import annotations

from typing import Any

from django.contrib.auth import authenticate
from django.db import transaction
from rest_framework_simplejwt.tokens import RefreshToken

from .models import Bitacora, Cuenta, Rol, Usuario


def generar_tokens(cuenta: Cuenta) -> dict[str, str]:
    refresh = RefreshToken.for_user(cuenta)
    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    }


@transaction.atomic
def registrar_bitacora(
    *,
    cuenta: Cuenta,
    tipo_accion: str,
    modulo_afectado: str,
    detalle: str = '',
) -> Bitacora:
    return Bitacora.objects.create(
        cuenta=cuenta,
        tipo_accion=tipo_accion,
        modulo_afectado=modulo_afectado,
        detalle=detalle,
    )


@transaction.atomic
def crear_rol(nombre: str, descripcion: str = '') -> Rol:
    rol, _ = Rol.objects.get_or_create(
        nombre=nombre,
        defaults={'descripcion': descripcion},
    )
    if descripcion and rol.descripcion != descripcion:
        rol.descripcion = descripcion
        rol.save(update_fields=['descripcion'])
    return rol


@transaction.atomic
def registrar_cuenta(
    *,
    correo: str,
    clave: str,
    nombre: str,
    apellido: str,
    cedula: str,
    fecha_nacimiento,
    sexo: str,
    rol_nombre: str = 'usuario',
) -> Cuenta:
    rol = crear_rol(rol_nombre)
    cuenta = Cuenta.objects.create_user(
        correo=correo,
        password=clave,
        rol=rol,
    )
    Usuario.objects.create(
        cuenta=cuenta,
        nombres=nombre,
        apellidos=apellido,
        cedula=cedula,
        fecha_nacimiento=fecha_nacimiento,
        sexo=sexo,
    )
    return cuenta


@transaction.atomic
def crear_usuario(
    *,
    correo: str,
    clave: str,
    nombre: str,
    apellido: str,
    cedula: str,
    fecha_nacimiento,
    sexo: str,
    rol_nombre: str = 'usuario',
) -> Cuenta:
    return registrar_cuenta(
        correo=correo,
        clave=clave,
        nombre=nombre,
        apellido=apellido,
        cedula=cedula,
        fecha_nacimiento=fecha_nacimiento,
        sexo=sexo,
        rol_nombre=rol_nombre,
    )


def autenticar_cuenta(*, request, correo: str, clave: str):
    return authenticate(request, correo=correo, password=clave)


def obtener_cuenta_por_correo(correo: str):
    return Cuenta.objects.filter(correo__iexact=correo).first()


def actualizar_perfil_usuario(instance: Cuenta, validated_data: dict[str, Any]) -> Cuenta:
    if hasattr(instance, 'perfil'):
        if 'nombre' in validated_data:
            instance.perfil.nombres = validated_data['nombre']
        if 'apellido' in validated_data:
            instance.perfil.apellidos = validated_data['apellido']
        if 'sexo' in validated_data:
            instance.perfil.sexo = validated_data['sexo']
        instance.perfil.save()
    return instance


def obtener_bitacoras_recientes(limite: int = 100):
    return Bitacora.objects.all()[:limite]