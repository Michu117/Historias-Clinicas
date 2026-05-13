from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APIClient, APITestCase

from .models import Notificacion


User = get_user_model()


class NotificacionAPITests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='usuario', password='test1234')
        self.other_user = User.objects.create_user(username='usuario2', password='test1234')
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)

    def test_create_notificacion(self):
        payload = {
            'usuario_destinatario': self.user.pk,
            'tipo': 'confirmacion',
            'estado': 'no_leido',
            'mensaje': 'Tu cita ha sido confirmada.',
            'origen_evento': 'confirmacion',
        }
        response = self.client.post('/api/v1/notificaciones/', payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Notificacion.objects.count(), 1)
        self.assertEqual(response.data['estado'], 'no_leido')

    def test_list_notificaciones(self):
        Notificacion.objects.create(
            usuario_destinatario=self.user,
            tipo='confirmacion',
            mensaje='Notificación de prueba',
            origen_evento='confirmacion',
        )
        response = self.client.get('/api/v1/notificaciones/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    def test_filtrar_por_estado(self):
        Notificacion.objects.create(
            usuario_destinatario=self.user,
            tipo='confirmacion',
            mensaje='Notificación leída',
            estado='leido',
            origen_evento='confirmacion',
        )
        Notificacion.objects.create(
            usuario_destinatario=self.user,
            tipo='cancelacion',
            mensaje='Notificación no leída',
            origen_evento='cancelacion',
        )
        response = self.client.get('/api/v1/notificaciones/', {'estado': 'no_leido'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['estado'], 'no_leido')

    def test_marcar_como_leida(self):
        notification = Notificacion.objects.create(
            usuario_destinatario=self.user,
            tipo='confirmacion',
            mensaje='Notificación pendiente',
            origen_evento='confirmacion',
        )
        response = self.client.patch(f'/api/v1/notificaciones/{notification.pk}/leer/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['estado'], 'leido')

    def test_marcar_todas_como_leidas(self):
        Notificacion.objects.bulk_create([
            Notificacion(
                usuario_destinatario=self.user,
                tipo='confirmacion',
                mensaje='Notificación 1',
                origen_evento='confirmacion',
            ),
            Notificacion(
                usuario_destinatario=self.user,
                tipo='cancelacion',
                mensaje='Notificación 2',
                origen_evento='cancelacion',
            ),
        ])
        response = self.client.patch('/api/v1/notificaciones/marcar-como-leidas/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['notificaciones_marcadas'], 2)
        self.assertEqual(Notificacion.objects.filter(usuario_destinatario=self.user, estado='leido').count(), 2)
