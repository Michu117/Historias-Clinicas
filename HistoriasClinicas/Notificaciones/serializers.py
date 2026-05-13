from django.contrib.auth import get_user_model
from rest_framework import serializers

from .models import Notificacion

User = get_user_model()


class NotificacionSerializer(serializers.ModelSerializer):
    usuario_destinatario = serializers.PrimaryKeyRelatedField(queryset=User.objects.all())

    class Meta:
        model = Notificacion
        fields = [
            'id',
            'usuario_destinatario',
            'cita_id',
            'tipo',
            'estado',
            'mensaje',
            'fecha_creacion',
            'fecha_modificacion',
            'usuario_creacion',
            'usuario_modificacion',
            'origen_evento',
            'detalles',
        ]
        read_only_fields = [
            'id',
            'fecha_creacion',
            'fecha_modificacion',
            'usuario_creacion',
            'usuario_modificacion',
        ]

    def validate(self, attrs):
        if attrs.get('estado') not in dict(Notificacion.ESTADO_CHOICES):
            raise serializers.ValidationError({'estado': 'Estado inválido.'})
        if attrs.get('tipo') not in dict(Notificacion.TIPO_CHOICES):
            raise serializers.ValidationError({'tipo': 'Tipo de notificación inválido.'})
        if not attrs.get('mensaje'):
            raise serializers.ValidationError({'mensaje': 'El mensaje es obligatorio.'})
        if not attrs.get('origen_evento'):
            raise serializers.ValidationError({'origen_evento': 'El origen del evento es obligatorio.'})
        return attrs
