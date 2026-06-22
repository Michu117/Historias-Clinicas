from django.urls import path

from . import views

urlpatterns = [
    path("historias_clinicas/",views.HistoriaClinicaListCreateView.as_view(),name="historia-clinica-list",),
    path("historias_clinicas/<int:pk>/",views.HistoriaClinicaDetailView.as_view(),name="historia-clinica-detail",),

    path("casos/",views.CasoListCreateView.as_view(),name="caso-list",),
    path("casos/<int:pk>/",views.CasoDetailView.as_view(),name="caso-detail",),
    path("antecedentes/",views.AntecedenteListCreateView.as_view(),name="antecedente-list",),
    path("antecedentes/<int:pk>/",views.AntecedenteDetailView.as_view(),name="antecedente-detail",),
    path("documentos/",views.DocumentoListCreateView.as_view(),name="documento-list",),
    path("documentos/<int:pk>/",views.DocumentoDetailView.as_view(),name="documento-detail",
    ),
    path("historias_clinicas/<int:historia_id>/consultas/",views.HistoriaConsultasListView.as_view(),name="historia-consultas",
    ),
]
