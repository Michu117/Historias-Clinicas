from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from django.contrib.auth import get_user_model
from .models import Report


class ReportAPITestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = get_user_model().objects.create_user(username='testuser', password='testpass')
        self.report = Report.objects.create(title='Test', data={'a': 1})

    def test_unauthenticated_denied(self):
        resp = self.client.get(reverse('report-list'))
        self.assertEqual(resp.status_code, 401)

    def test_authenticated_list(self):
        self.client.force_authenticate(user=self.user)
        resp = self.client.get(reverse('report-list'))
        self.assertEqual(resp.status_code, 200)

    def test_create_report(self):
        self.client.force_authenticate(user=self.user)
        payload = {'title': 'New', 'data': {'x': 1}}
        resp = self.client.post(reverse('report-list'), payload, format='json')
        self.assertEqual(resp.status_code, 201)
        self.assertEqual(Report.objects.filter(title='New').count(), 1)

