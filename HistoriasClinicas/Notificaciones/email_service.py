import logging
from django.conf import settings
from django.core.mail import send_mail
from django.template.loader import render_to_string

logger = logging.getLogger(__name__)

TIPO_LABEL = {
    'creacion': 'Cita Creada',
    'confirmacion': 'Cita Confirmada',
    'reagendamiento': 'Cita Reagendada',
    'cancelacion': 'Cita Cancelada',
    'derivacion': 'Derivación',
    'atencion': 'Atención Registrada',
}


def enviar_email_notificacion(notificacion):
    usuario = notificacion.usuario_destinatario
    correo_destino = getattr(usuario, 'correo', None) or usuario.email

    if not correo_destino:
        logger.warning('Notificación %s: destinatario sin correo', notificacion.id)
        return False

    if not settings.EMAIL_HOST_USER:
        logger.warning('EMAIL_HOST_USER no configurado. Email no enviado.')
        return False

    tipo_label = TIPO_LABEL.get(notificacion.tipo, notificacion.tipo)
    detalles_extra = ''
    if notificacion.detalles:
        if isinstance(notificacion.detalles, dict):
            detalles_extra = notificacion.detalles.get('info_extra', '')

    subject = f'[MediCampus] {tipo_label}'
    html_message = render_to_string('notificaciones/email_notificacion.html', {
        'tipo': notificacion.tipo,
        'tipo_label': tipo_label,
        'mensaje': notificacion.mensaje,
        'detalles': detalles_extra,
    })
    plain_message = f'{tipo_label}\n\n{notificacion.mensaje}'

    try:
        send_mail(
            subject=subject,
            message=plain_message,
            html_message=html_message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[correo_destino],
            fail_silently=False,
        )
        logger.info('Email enviado a %s para notificación %s', correo_destino, notificacion.id)
        return True
    except Exception as e:
        logger.error('Error al enviar email a %s: %s', correo_destino, e)
        return False
