from datetime import timedelta

from django.contrib.auth import get_user_model
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase

from .models import Cita, EstadoCita, Servicio
from .services import ConflictoHorarioError, DatosInvalidosError, validar_choque_citas, validar_servicios_cita, validar_anticipacion_minima


class AgendasServicesTest(APITestCase):
    def setUp(self):
        self.usuario_id = 1
        self.usuario_alterno_id = 2
        self.servicio = Servicio.objects.create(nombre='Atención general')
        self.cita = Cita.objects.create(
            usuario_id=self.usuario_id,
            fecha_hora=timezone.now() + timedelta(hours=24),
        )

    def test_validar_choque_citas_detecta_conflicto(self):
        Cita.objects.create(
            usuario_id=self.usuario_alterno_id,
            fecha_hora=self.cita.fecha_hora,
        )

        with self.assertRaises(ConflictoHorarioError):
            validar_choque_citas(self.usuario_id, self.cita.fecha_hora)

    def test_validar_servicios_cita_rechaza_servicio_invalido(self):
        with self.assertRaises(DatosInvalidosError):
            validar_servicios_cita([9999])

    def test_validar_anticipacion_minima_cumple_mas_de_24h(self):
        fecha_hora = timezone.now() + timedelta(hours=25)
        self.assertTrue(validar_anticipacion_minima(fecha_hora))

    def test_validar_anticipacion_minima_cumple_exactas_24h(self):
        fecha_hora = timezone.now() + timedelta(hours=24, microseconds=1000)
        self.assertTrue(validar_anticipacion_minima(fecha_hora))

    def test_validar_anticipacion_minima_no_cumple_23h_59m(self):
        fecha_hora = timezone.now() + timedelta(hours=23, minutes=59)
        self.assertFalse(validar_anticipacion_minima(fecha_hora))

    def test_validar_anticipacion_minima_no_cumple_pasado(self):
        fecha_hora = timezone.now() - timedelta(hours=1)
        self.assertFalse(validar_anticipacion_minima(fecha_hora))

    def test_validar_anticipacion_minima_no_cumple_ahora(self):
        self.assertFalse(validar_anticipacion_minima(timezone.now()))


class AgendasViewTest(APITestCase):
    def setUp(self):
        self.user = get_user_model().objects.create_user(
            correo='usuario@example.com',
            password='test1234',
        )
        self.client.force_authenticate(user=self.user)
        self.usuario_id = 1
        self.usuario_alterno_id = 2
        self.servicio = Servicio.objects.create(nombre='Consulta psicológica')

    def test_crear_cita_exitoso(self):
        fecha_hora = (timezone.now() + timedelta(days=1)).isoformat()
        response = self.client.post(
            '/api/v1/agendas/citas/',
            {
                'usuario_id': self.usuario_id,
                'fecha_hora': fecha_hora,
                'motivo': 'Sesión inicial',
                'servicios': [self.servicio.id],
            },
            format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['usuario_id'], self.usuario_id)

    def test_crear_cita_conflicto_horario(self):
        fecha_hora = timezone.now() + timedelta(days=1)
        Cita.objects.create(
            usuario_id=self.usuario_alterno_id,
            fecha_hora=fecha_hora,
        )

        response = self.client.post(
            '/api/v1/agendas/citas/',
            {
                'usuario_id': self.usuario_id,
                'fecha_hora': fecha_hora.isoformat(),
                'motivo': 'Sesión de seguimiento',
            },
            format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_409_CONFLICT)

    def test_cancelar_cita_23h_59m_falla(self):
        fecha_hora = timezone.now() + timedelta(hours=23, minutes=59)
        cita = Cita.objects.create(
            usuario_id=self.usuario_id,
            fecha_hora=fecha_hora,
        )
        response = self.client.patch(
            f'/api/v1/agendas/citas/{cita.id}/',
            {'estado': 'CANCELADA'},
            format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('24 horas', str(response.data))
        self.assertEqual(response.data['error']['code'], 'CANCELLATION_TIME_RESTRICTION')

        cita.refresh_from_db()
        self.assertNotEqual(cita.estado, EstadoCita.CANCELADA)

    def test_cancelar_cita_24h_exitoso(self):
        fecha_hora = timezone.now() + timedelta(days=2)
        cita = Cita.objects.create(
            usuario_id=self.usuario_id,
            fecha_hora=fecha_hora,
            estado=EstadoCita.AGENDADA,
        )
        response = self.client.patch(
            f'/api/v1/agendas/citas/{cita.id}/',
            {'estado': 'CANCELADA'},
            format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        cita.refresh_from_db()
        self.assertEqual(cita.estado, EstadoCita.CANCELADA)

    def test_crear_cita_menos_24h_rechazada(self):
        fecha_hora = (timezone.now() + timedelta(hours=23)).isoformat()
        response = self.client.post(
            '/api/v1/agendas/citas/',
            {
                'usuario_id': self.usuario_id,
                'fecha_hora': fecha_hora,
                'motivo': 'Cita sin anticipación',
                'servicios': [self.servicio.id],
            },
            format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_agendamiento_slots_respetan_horarios(self):
        from .services import _generar_slots_dia
        manana = timezone.now().date() + timedelta(days=1)
        slots = _generar_slots_dia(manana)
        slot_times = {(s.hour, s.minute) for s in slots}

        # Morning: 08:00 - 12:00 (último slot 12:00)
        for h, m in [(8, 0), (8, 30), (9, 0), (9, 30), (10, 0), (10, 30), (11, 0), (11, 30), (12, 0)]:
            self.assertIn((h, m), slot_times, f'Slot matutino {h:02d}:{m:02d} debería existir')

        # No slots en break 12:30-15:00
        for h in range(12, 15):
            for m in [0, 30]:
                if (h == 12 and m < 30) or (h >= 15):
                    continue
                self.assertNotIn((h, m), slot_times, f'Slot en break {h:02d}:{m:02d} no debería existir')

        # Afternoon: 15:00 - 17:00 (último slot 17:00)
        for h, m in [(15, 0), (15, 30), (16, 0), (16, 30), (17, 0)]:
            self.assertIn((h, m), slot_times, f'Slot vespertino {h:02d}:{m:02d} debería existir')

        self.assertNotIn((17, 30), slot_times, '17:30 no debería ser slot')

    def test_buscar_siguiente_cita_no_devuelve_menos_24h(self):
        from Seguridad.models import Cuenta, Rol
        from .services import buscar_siguiente_cita_disponible

        rol = Rol.objects.create(nombre='psicologo')
        profesional = Cuenta.objects.create_user(
            correo='profesional@test.com',
            password='test1234',
            is_active=True,
        )
        profesional.roles.add(rol)

        servicio = Servicio.objects.create(nombre='Psicologia')
        _, slot = buscar_siguiente_cita_disponible(
            servicio_id=servicio.id,
            servicio_nombre=servicio.nombre,
            usuario_id=self.usuario_id,
        )
        ahora = timezone.now()
        self.assertGreaterEqual(
            slot,
            ahora + timedelta(hours=24),
            'El slot devuelto debe estar al menos 24h en el futuro',
        )
