from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from django.contrib.auth import get_user_model
from .models import Reporte
from datetime import date


class ReportAPITestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = get_user_model().objects.create_user(username='testuser', password='testpass')
        # Crear un Reporte mínimo (titulos y rango de fechas obligatorios)
        self.report = Reporte.objects.create(titulo='Test', fecha_inicio=date.today(), fecha_fin=date.today())

    def test_unauthenticated_denied(self):
        resp = self.client.get(reverse('report-list'))
        self.assertEqual(resp.status_code, 401)

    def test_authenticated_list(self):
        self.client.force_authenticate(user=self.user)
        resp = self.client.get(reverse('report-list'))
        self.assertEqual(resp.status_code, 200)

    def test_create_report(self):
        self.client.force_authenticate(user=self.user)
        payload = {
            'titulo': 'New',
            'fecha_inicio': date.today().isoformat(),
            'fecha_fin': date.today().isoformat()
        }
        resp = self.client.post(reverse('report-list'), payload, format='json')
        self.assertEqual(resp.status_code, 201)
        self.assertEqual(Reporte.objects.filter(titulo='New').count(), 1)

