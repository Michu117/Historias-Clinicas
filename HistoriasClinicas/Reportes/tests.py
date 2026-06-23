from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from django.contrib.auth import get_user_model
from .models import Reporte
from datetime import date


class ReportAPITestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = get_user_model().objects.create_user(correo='test@example.com', password='testpass')
        # Crear un Reporte mínimo (titulos y rango de fechas obligatorios)
        self.report = Reporte.objects.create(titulo='Test', fecha_inicio=date.today(), fecha_fin=date.today())

    def test_unauthenticated_denied(self):
        resp = self.client.get(reverse('report-list'))
        self.assertEqual(resp.status_code, 401)

    def test_authenticated_list(self):
        self.client.force_authenticate(user=self.user)
        resp = self.client.get(reverse('report-list'))
        self.assertEqual(resp.status_code, 200)

    def test_report_detail_crud(self):
        self.client.force_authenticate(user=self.user)

        detail_url = reverse('report-detail', kwargs={'pk': self.report.id})
        get_resp = self.client.get(detail_url)
        self.assertEqual(get_resp.status_code, 200)

        patch_resp = self.client.patch(detail_url, {'titulo': 'Editado'}, format='json')
        self.assertEqual(patch_resp.status_code, 200)

        delete_resp = self.client.delete(detail_url)
        self.assertEqual(delete_resp.status_code, 204)

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

    def test_estadisticas_respuesta_json(self):
        self.client.force_authenticate(user=self.user)
        resp = self.client.get(reverse('estadisticas'))
        self.assertEqual(resp.status_code, 200)
        body = resp.json()
        self.assertIn('success', body)
        self.assertIn('message', body)
        self.assertIn('data', body)
        self.assertIn('consultas_por_genero', body['data'])
        self.assertIn('items', body['data']['consultas_por_genero'])

    def test_all_reportes_stats_endpoints(self):
        self.client.force_authenticate(user=self.user)
        endpoints = [
            'atenciones-stats',
            'estadisticas',
            'consultas-por-genero',
            'diagnosticos-frecuentes',
            'servicios-mas-usados',
        ]

        for endpoint_name in endpoints:
            resp = self.client.get(reverse(endpoint_name))
            self.assertEqual(resp.status_code, 200)
            body = resp.json()
            self.assertIn('success', body)
            self.assertTrue(body['success'])
            self.assertIn('data', body)

