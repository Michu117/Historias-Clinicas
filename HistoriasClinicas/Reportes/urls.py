from django.urls import path
from . import views

urlpatterns = [
    # Endpoints CRUD básicos
    path('', views.ReportListCreateAPIView.as_view(), name='report-list'),
    path('<int:pk>/', views.ReportDetailAPIView.as_view(), name='report-detail'),

    # Endpoints de estadísticas (RF-11, RF-14, RF-15)
    path('atenciones/', views.atenciones_stats_view, name='atenciones-stats'),
    path('estadisticas/', views.estadisticas_view, name='estadisticas'),
    path('consultas-por-genero/', views.consultas_por_genero_view, name='consultas-por-genero'),
    path('diagnosticos-frecuentes/', views.diagnosticos_frecuentes_view, name='diagnosticos-frecuentes'),
    path('servicios-mas-usados/', views.servicios_mas_usados_view, name='servicios-mas-usados'),
]
