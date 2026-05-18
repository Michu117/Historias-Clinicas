from django.urls import path

from .views import (
    NotificacionDetailView,
    NotificacionListCreateView,
    NotificacionMarkAllReadView,
    NotificacionMarkReadView,
)

urlpatterns = [
    path('', NotificacionListCreateView.as_view(), name='notificacion-list-create'),
    path('<int:pk>/', NotificacionDetailView.as_view(), name='notificacion-detail'),
    path('<int:pk>/leer/', NotificacionMarkReadView.as_view(), name='notificacion-mark-read'),
    path('marcar-como-leidas/', NotificacionMarkAllReadView.as_view(), name='notificacion-mark-all-read'),
]