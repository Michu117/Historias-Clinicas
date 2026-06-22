import logging
from django.contrib.auth import get_user_model
from django.core.exceptions import PermissionDenied
from django.shortcuts import get_object_or_404

from .models import Notificacion
from .email_service import enviar_email_notificacion

logger = logging.getLogger(__name__)

User = get_user_model()


def user_has_notification_access(user, notification):
    if notification.usuario_destinatario == user:
        return True
    if user.is_superuser or user.is_staff:
        return True
    allowed_roles = {'administrador', 'profesional'}
    user_groups = set(user.groups.values_list('name', flat=True))
    return bool(user_groups & allowed_roles)


def get_notifications_for_user(user, filtros=None):
    filtros = filtros or {}
    queryset = Notificacion.objects.all()

    if not (user.is_superuser or user.is_staff):
        queryset = queryset.filter(usuario_destinatario=user)
    else:
        usuario_id = filtros.get('usuario_id')
        if usuario_id:
            queryset = queryset.filter(usuario_destinatario__pk=usuario_id)

    estado = filtros.get('estado')
    tipo = filtros.get('tipo')
    cita_id = filtros.get('cita_id')

    if estado:
        queryset = queryset.filter(estado=estado)
    if tipo:
        queryset = queryset.filter(tipo=tipo)
    if cita_id:
        queryset = queryset.filter(cita_id=cita_id)

    return queryset.order_by('-fecha_creacion')


def get_notification_detail(user, pk):
    notification = get_object_or_404(Notificacion, pk=pk)
    if not user_has_notification_access(user, notification):
        raise PermissionDenied('No tiene permiso para acceder a esta notificación.')
    return notification


def create_notification(validated_data, created_by=None):
    destinatario = validated_data['usuario_destinatario']
    if created_by and created_by != destinatario and not (created_by.is_superuser or created_by.is_staff):
        raise PermissionDenied('No tiene permiso para crear notificaciones para otros usuarios.')

    notification = Notificacion.objects.create(
        usuario_destinatario=destinatario,
        cita=validated_data.get('cita'),
        tipo=validated_data['tipo'],
        estado=validated_data.get('estado', Notificacion.ESTADO_NO_LEIDO),
        mensaje=validated_data['mensaje'],
        usuario_creacion=created_by,
        usuario_modificacion=created_by,
        origen_evento=validated_data['origen_evento'],
        detalles=validated_data.get('detalles') or {},
    )
    try:
        enviar_email_notificacion(notification)
    except Exception as e:
        logger.error('Error al enviar email para notificación %s: %s', notification.id, e)
    return notification


def mark_notification_read(user, pk):
    notification = get_notification_detail(user, pk)
    if notification.estado != Notificacion.ESTADO_LEIDO:
        notification.estado = Notificacion.ESTADO_LEIDO
        notification.usuario_modificacion = user
        notification.save(update_fields=['estado', 'usuario_modificacion', 'fecha_modificacion'])
    return notification


def mark_notifications_read(user, filtros=None, ids=None):
    filtros = filtros or {}
    queryset = get_notifications_for_user(user, filtros)
    if ids is not None:
        queryset = queryset.filter(pk__in=ids)
    updated = queryset.exclude(estado=Notificacion.ESTADO_LEIDO).update(
        estado=Notificacion.ESTADO_LEIDO,
        usuario_modificacion=user,
    )
    return updated


def generate_notification_for_event(event_type, destinatario, cita=None, detalles=None, created_by=None):
    if isinstance(destinatario, int):
        destinatario = get_object_or_404(User, pk=destinatario)

    mensaje = detalles.get('mensaje') if detalles and isinstance(detalles, dict) and detalles.get('mensaje') else None
    if not mensaje:
        mensaje = f'Evento de notificación: {event_type}'

    return create_notification(
        {
            'usuario_destinatario': destinatario,
            'cita': cita,
            'tipo': event_type,
            'estado': Notificacion.ESTADO_NO_LEIDO,
            'mensaje': mensaje,
            'origen_evento': event_type,
            'detalles': detalles or {},
        },
        created_by=created_by,
    )
