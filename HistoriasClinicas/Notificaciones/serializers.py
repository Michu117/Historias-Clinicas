from django.contrib.auth import get_user_model
from rest_framework import serializers

from Agendas.models import Cita
from .models import Notificacion

User = get_user_model()


class NotificacionSerializer(serializers.ModelSerializer):
    usuario_destinatario = serializers.PrimaryKeyRelatedField(queryset=User.objects.all())
    cita = serializers.PrimaryKeyRelatedField(queryset=Cita.objects.all(), allow_null=True, required=False)

    class Meta:
        model = Notificacion
        fields = [
            'id',
            'usuario_destinatario',
            'cita',
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
        if not attrs.get('mensaje'):
            raise serializers.ValidationError({
                'mensaje': 'El mensaje es obligatorio.'
            })

        if not attrs.get('origen_evento'):
            raise serializers.ValidationError({
                'origen_evento': 'El origen del evento es obligatorio.'
            })

        return attrs
