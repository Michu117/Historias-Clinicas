from datetime import timedelta

from django.contrib.auth.models import User
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase

from .models import Cita, EstadoCita, Servicio
from .services import ConflictoHorarioError, DatosInvalidosError, validar_choque_citas, validar_servicios_cita


class AgendasServicesTest(APITestCase):
    def setUp(self):
        self.paciente_id = 1
        self.paciente_alterno_id = 2
        self.profesional_id = 1
        self.servicio = Servicio.objects.create(nombre='Atención general')
        self.cita = Cita.objects.create(
            paciente_id=self.paciente_id,
            profesional_id=self.profesional_id,
            fecha_hora=timezone.now() + timedelta(hours=24),
        )

    def test_validar_choque_citas_detecta_conflicto(self):
        Cita.objects.create(
            paciente_id=self.paciente_alterno_id,
            profesional_id=self.profesional_id,
            fecha_hora=self.cita.fecha_hora,
        )

        with self.assertRaises(ConflictoHorarioError):
            validar_choque_citas(self.profesional_id, self.cita.fecha_hora)

    def test_validar_servicios_cita_rechaza_servicio_invalido(self):
        with self.assertRaises(DatosInvalidosError):
            validar_servicios_cita([9999])


class AgendasViewTest(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='usuario', password='test1234')
        self.client.force_authenticate(user=self.user)
        self.paciente_id = 1
        self.paciente_alterno_id = 2
        self.profesional_id = 1
        self.servicio = Servicio.objects.create(nombre='Consulta psicológica')

    def test_crear_cita_exitoso(self):
        fecha_hora = (timezone.now() + timedelta(days=1)).isoformat()
        response = self.client.post(
            '/api/v1/agendas/citas/',
            {
                'paciente_id': self.paciente_id,
                'profesional_id': self.profesional_id,
                'fecha_hora': fecha_hora,
                'motivo': 'Sesión inicial',
                'servicios': [self.servicio.id],
            },
            format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['paciente_id'], self.paciente_id)
        self.assertEqual(response.data['profesional_id'], self.profesional_id)

    def test_crear_cita_conflicto_horario(self):
        fecha_hora = timezone.now() + timedelta(days=1)
        Cita.objects.create(
            paciente_id=self.paciente_alterno_id,
            profesional_id=self.profesional_id,
            fecha_hora=fecha_hora,
        )

        response = self.client.post(
            '/api/v1/agendas/citas/',
            {
                'paciente_id': self.paciente_id,
                'profesional_id': self.profesional_id,
                'fecha_hora': fecha_hora.isoformat(),
                'motivo': 'Sesión de seguimiento',
            },
            format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_409_CONFLICT)
