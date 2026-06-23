from __future__ import annotations

from typing import Any

from django.contrib.auth import authenticate
from django.db import models, transaction
from rest_framework_simplejwt.tokens import RefreshToken

from .models import Bitacora, Cuenta, Rol, Usuario


def generar_tokens(cuenta: Cuenta) -> dict[str, str]:
    refresh = RefreshToken.for_user(cuenta)
    rol_nombre = cuenta.rol.nombre if cuenta.rol else ''
    refresh['rol'] = rol_nombre
    refresh['email'] = cuenta.correo
    access = refresh.access_token
    access['rol'] = rol_nombre
    access['email'] = cuenta.correo
    return {
        'refresh': str(refresh),
        'access': str(access),
    }


@transaction.atomic
def registrar_bitacora(
    *,
    cuenta: Cuenta,
    tipo_accion: str,
    modulo_afectado: str,
    detalle: str = '',
    direccion_ip: str | None = None,
) -> Bitacora:
    return Bitacora.objects.create(
        cuenta=cuenta,
        tipo_accion=tipo_accion,
        modulo_afectado=modulo_afectado,
        detalle=detalle,
        direccion_ip=direccion_ip,
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
    must_change_password: bool = False,
) -> Cuenta:
    rol = crear_rol(rol_nombre)
    cuenta = Cuenta.objects.create_user(
        correo=correo,
        password=clave,
        rol=rol,
    )
    if must_change_password:
        cuenta.must_change_password = True
        cuenta.save(update_fields=['must_change_password'])
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
    must_change_password: bool = False,
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
        must_change_password=must_change_password,
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


def obtener_bitacoras(
    *,
    fecha_desde: str | None = None,
    fecha_hasta: str | None = None,
    tipo_accion: str | None = None,
    usuario_correo: str | None = None,
    limite: int = 100,
):
    qs = Bitacora.objects.select_related('cuenta').all()
    if fecha_desde:
        qs = qs.filter(fecha_hora__gte=fecha_desde)
    if fecha_hasta:
        qs = qs.filter(fecha_hora__lte=fecha_hasta)
    if tipo_accion:
        qs = qs.filter(tipo_accion=tipo_accion)
    if usuario_correo:
        qs = qs.filter(cuenta__correo__icontains=usuario_correo)
    return qs[:limite]


def obtener_bitacoras_recientes(limite: int = 100):
    return Bitacora.objects.all()[:limite]


def obtener_usuarios(
    *,
    rol_nombre: str | None = None,
    activo: bool | None = None,
    busqueda: str | None = None,
):
    qs = Cuenta.objects.select_related('rol', 'perfil').all()
    if rol_nombre:
        qs = qs.filter(rol__nombre__iexact=rol_nombre)
    if activo is not None:
        qs = qs.filter(is_active=activo)
    if busqueda:
        qs = qs.filter(
            models.Q(correo__icontains=busqueda)
            | models.Q(perfil__nombres__icontains=busqueda)
            | models.Q(perfil__apellidos__icontains=busqueda)
            | models.Q(perfil__cedula__icontains=busqueda)
        )
    return qs